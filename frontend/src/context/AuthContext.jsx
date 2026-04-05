import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth session error. Clearing state.");
          setUser(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          await enrichUser(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (e) {
        console.error("Critical error fetching session, corrupt state likely:", e);
        // Fallback for corrupted localStorage state holding app hostage
        supabase.auth.signOut().catch(() => {});
        setUser(null);
        setLoading(false);
      }
    };
    
    // Check if the user is a restaurant owner
    const enrichUser = async (authUser) => {
      try {
        const { data, error } = await supabase
          .from('restaurant_owners')
          .select('restaurant_id')
          .eq('owner_id', authUser.id)
          .single();
          
        if (data) {
          setUser({ ...authUser, isOwner: true, restaurantId: data.restaurant_id });
          setLoading(false);
          return;
        } 
        
        // Check if they exist in customers
        const { data: custData } = await supabase
          .from('customers')
          .select('customer_id')
          .eq('customer_id', authUser.id)
          .single();
          
        if (!custData) {
          // Auto-sync missing user directly into database
          await supabase.from('customers').insert([{
            customer_id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email.split('@')[0],
            email: authUser.email,
            phone_number: authUser.user_metadata?.phone_number || 'N/A'
          }]);
        }
        
        setUser({ ...authUser, isOwner: false });
      } catch (err) {
        setUser({ ...authUser, isOwner: false });
      }
      setLoading(false);
    };
    
    fetchSession();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setLoading(true);
        await enrichUser(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut(),
    user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
