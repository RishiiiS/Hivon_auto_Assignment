import { useState, useEffect } from 'react';
import { getToken, removeToken, getDecodedUser } from '@/lib/auth';
import { api } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to validate session against the backend
    async function validateSession() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { user: backendUser } = await api.get('/auth/me');
        setUser(backendUser);
      } catch (e) {
        removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    validateSession();
  }, []);

  const logout = () => {
    // Call backend API if needed, then remove token locally
    api.post('/auth/logout', {}).catch(console.error);
    removeToken();
    setUser(null);
  };

  return { user, loading, logout };
}
