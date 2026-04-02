import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const validateSession = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        setUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('id, name, email, role, avatar_url')
        .eq('id', authUser.id)
        .maybeSingle();

      setUser({
        id: authUser.id,
        name: profile?.name || null,
        email: profile?.email || authUser.email || null,
        role: profile?.role || 'user',
        avatar_url: profile?.avatar_url || null,
      });
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    validateSession();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      validateSession();
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [validateSession]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, logout };
}
