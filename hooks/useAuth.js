import { useState, useEffect, useCallback } from 'react';
import { getToken, removeToken } from '@/lib/auth';
import { api } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const validateSession = useCallback(async () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res?.error) {
        removeToken();
        setUser(null);
        return;
      }
      setUser(res.user || null);
    } catch (e) {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    validateSession();

    function handleAuthChanged() {
      validateSession();
    }

    function handleStorage(event) {
      if (event.key === 'auth_token') {
        validateSession();
      }
    }

    window.addEventListener('auth:changed', handleAuthChanged);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('auth:changed', handleAuthChanged);
      window.removeEventListener('storage', handleStorage);
    };
  }, [validateSession]);

  const logout = () => {
    // Call backend API if needed, then remove token locally
    api.post('/auth/logout', {}).catch(console.error);
    removeToken();
    setUser(null);
  };

  return { user, loading, logout };
}
