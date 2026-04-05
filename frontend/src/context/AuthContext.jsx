import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

// Promise that rejects after ms milliseconds
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timed out')), ms)
  );
  return Promise.race([promise, timeout]);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastUserId = useRef(null);

  const enrichUser = useCallback(async (authUser, force = false) => {
    if (!authUser) return;
    
    // 🟣 Cache key for this specific user
    const cacheKey = `foodos_role_${authUser.id}`;

    // 🔥 Fix: Check Ref only, don't depend on 'user' state to avoid loop
    if (!force && lastUserId.current === authUser.id) return;
    lastUserId.current = authUser.id;

    try {
      const { data } = await withTimeout(
        supabase
          .from('restaurant_owners')
          .select('restaurant_id')
          .eq('owner_id', authUser.id)
          .maybeSingle(),
        10000 
      );

      if (data) {
        const ownerInfo = { isOwner: true, restaurantId: data.restaurant_id };
        setUser({ ...authUser, ...ownerInfo });
        localStorage.setItem(cacheKey, JSON.stringify(ownerInfo));
        return;
      }
    } catch (err) {
      console.log('Restaurant membership check: timeout or failure');
    }

    // ⚡ Verification truly complete and no owner found
    const customerInfo = { isOwner: false, restaurantId: null };
    setUser({ ...authUser, ...customerInfo });
    localStorage.setItem(cacheKey, JSON.stringify(customerInfo));
  }, []); // ⚡ Stable callback

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!session?.user) {
          // No session: we must stop loading now so the login or home page can show.
          if (mounted) setLoading(false);
        }
      } catch (e) {
        console.log('Session fetch skipped or failed: ', e.message);
        if (mounted) setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        // ⚡ INSTANT LOAD: check cache first for sub-millisecond transition
        const cacheKey = `foodos_role_${session.user.id}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          const { isOwner, restaurantId } = JSON.parse(cached);
          setUser({ ...session.user, isOwner, restaurantId });
          if (mounted) setLoading(false); // 🔥 FAST PATH EXIT
        }

        // BACKGROUND REFRESH: ensure role is still correct (no lock contention issues)
        enrichUser(session.user, false).then(() => {
          if (mounted) setLoading(false); // 🔥 SLOW PATH EXIT (fallback/first-time)
        });

      } else if (event === 'SIGNED_OUT') {
        const oldUserId = lastUserId.current;
        if (oldUserId) localStorage.removeItem(`foodos_role_${oldUserId}`);
        
        lastUserId.current = null;
        setUser(null);
        if (mounted) setLoading(false);
      } else {
        if (mounted && event !== 'TOKEN_REFRESHED') setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [enrichUser]);

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: async () => {
      const oldUserId = user?.id;
      if (oldUserId) localStorage.removeItem(`foodos_role_${oldUserId}`);
      lastUserId.current = null;
      return supabase.auth.signOut();
    },
    user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-amber-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
            <p className="text-amber-600 font-semibold text-lg">Loading FoodOS...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
