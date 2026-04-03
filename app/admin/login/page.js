'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth(); // onAuthStateChange will auto-update this

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        setError(authError.message || 'Invalid login credentials');
        setLoading(false);
        return;
      }
      
      // Wait for useAuth hook to automatically trigger a redirect when 'user' updates.
      // We can also eagerly push.
      router.push('/admin');

    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  if (user && user.role === 'admin') {
    router.push('/admin');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-sm text-gray-500">Sign in with your administrator credentials</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4BB5]/20 focus:border-[#0A4BB5]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4BB5]/20 focus:border-[#0A4BB5]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A4BB5] hover:bg-[#083b8f] text-white font-semibold py-2.5 rounded-md transition-colors disabled:opacity-70 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            &larr; Back to Public Site
          </button>
        </div>
      </div>
    </div>
  );
}
