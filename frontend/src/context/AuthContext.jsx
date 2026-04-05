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
    if (!force && lastUserId.current === authUser.id) return;
    lastUserId.current = authUser.id;

    try {
      const { data } = await withTimeout(
        supabase
          .from('restaurant_owners')
          .select('restaurant_id')
          .eq('owner_id', authUser.id)
          .maybeSingle(),
        3000 // 3 second max for this query
      );

      if (data) {
        setUser({ ...authUser, isOwner: true, restaurantId: data.restaurant_id });
        return;
      }
    } catch (err) {
      // Timed out or failed — just treat as non-owner
      console.warn('Owner check skipped:', err.message);
    }

    // Default: set as normal customer
    setUser({ ...authUser, isOwner: false });

    // Background: ensure customer row exists (don't await, don't block)
    supabase
      .from('customers')
      .select('customer_id')
      .eq('customer_id', authUser.id)
      .maybeSingle()
      .then(({ data: custData }) => {
        if (!custData) {
          supabase.from('customers').insert([{
            customer_id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
            email: authUser.email,
            phone_number: authUser.user_metadata?.phone_number || 'N/A'
          }]).then(() => {});
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          3000 // 3 second max for session check
        );

        if (!mounted) return;

        if (session?.user) {
          await enrichUser(session.user, true);
        }
      } catch (e) {
        // getSession timed out or failed — just show login page
        console.warn('Session init:', e.message);
      } finally {
        // ALWAYS stop loading no matter what happened above
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // Listen for login/logout only
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        await enrichUser(session.user, true);
        if (mounted) setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        lastUserId.current = null;
        setUser(null);
      }
      // TOKEN_REFRESHED → ignore completely
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
