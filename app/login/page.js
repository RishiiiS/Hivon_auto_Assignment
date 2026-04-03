'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-[#FCFBFA] font-sans selection:bg-blue-100 relative overflow-hidden absolute inset-0 z-50">
      
      {/* Huge Watermark Background */}
      <div className="absolute inset-x-0 bottom-24 flex justify-center pointer-events-none z-0">
        <h1 className="text-[15vw] font-serif font-bold text-gray-200/50 tracking-tighter select-none leading-none">
          ARCHIVE
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 z-10 pt-16">
        
        {/* Floating Header Logo */}
        <div className="flex flex-col items-center justify-center mb-8 gap-4">
          <div className="w-10 h-8 rounded shadow-sm border border-gray-200 flex items-center justify-center text-[#0A4BB5] bg-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-extrabold tracking-tight text-gray-900">The Archive</h2>
        </div>

        {/* Login Card Container */}
        <div className="w-full max-w-[560px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-10 md:p-14 border border-gray-100 relative">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif text-gray-900 mb-2">Welcome back</h1>
            <p className="text-sm text-gray-500 font-medium">Continue your journey through the curated world.</p>
          </div>

          {error && <div className="mb-6 text-red-600 text-xs p-3 bg-red-50 rounded border border-red-100 text-center">{error}</div>}

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Email Address</label>
              <input 
                type="email" 
                placeholder="curator@archive.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="w-full pb-3 text-sm border-b border-gray-200 focus:border-[#0A4BB5] focus:outline-none transition-colors placeholder:text-gray-300 bg-transparent rounded-none"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Password</label>
                <a href="#" className="text-[10px] font-bold text-[#0A4BB5] tracking-widest uppercase hover:text-[#083b8f]">Forgot?</a>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="w-full pb-3 text-sm border-b border-gray-200 focus:border-[#0A4BB5] focus:outline-none transition-colors placeholder:text-gray-300 bg-transparent rounded-none tracking-widest"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-[#0A4BB5] text-white text-sm font-semibold rounded-md hover:bg-[#083b8f] focus:outline-none focus:ring-2 focus:ring-[#0A4BB5] focus:ring-offset-2 transition-all shadow-md shadow-[#0A4BB5]/20 disabled:opacity-70"
            >
              {loading ? 'Authenticating...' : 'Sign in'}
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="h-px bg-gray-100 flex-1"></div>
            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Or continue with</span>
            <div className="h-px bg-gray-100 flex-1"></div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={() => handleOAuthLogin('google')} type="button" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors text-xs font-semibold text-gray-800 disabled:opacity-70">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.58c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.58-2.77c-.98.66-2.23 1.06-3.7 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>
        </div>

        {/* Create Account Link underneath card */}
        <div className="z-10 mt-8 text-xs text-gray-500 font-medium pb-8 border-b-2 border-transparent">
          Don't have an account? <a href="/signup" className="text-[#0A4BB5] font-bold ml-1 hover:-translate-y-0.5 transition-transform inline-block">Join The Archive</a>
        </div>
        
        {/* Middle Footer Privacy Links */}
        <div className="z-10 mt-4 mb-16 flex gap-4 text-[9px] font-bold text-gray-400/80 tracking-widest uppercase text-center w-full justify-center">
           <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
           <span>•</span>
           <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
           <span>•</span>
           <a href="#" className="hover:text-gray-600 transition-colors">Support</a>
        </div>
      </div>

      {/* Static Fixed Footer Bar */}
      <div className="z-10 w-full px-6 py-5 flex flex-col md:flex-row justify-between items-center bg-[#FCFBFA] border-t border-gray-100 mt-auto shadow-[0_-1px_15px_rgb(0,0,0,0.01)] relative">
         <div className="font-serif font-bold text-gray-900 text-sm mb-4 md:mb-0">The Archive</div>
         <div className="flex gap-4 md:gap-6 font-medium text-xs text-gray-700 mb-4 md:mb-0">
           <a href="#" className="hover:text-gray-900 transition-colors">About</a>
           <a href="#" className="hover:text-gray-900 transition-colors">Write</a>
           <a href="#" className="hover:text-gray-900 transition-colors">Help</a>
         </div>
         <div className="text-xs text-gray-500 font-medium">
            © 2024 The Editorial Archive. Designed for the Digital Curator.
         </div>
      </div>

      {/* Injecting CSS to ensure font-serif maps cleanly and hiding Navbar */}
      <style dangerouslySetInnerHTML={{__html: `
        #global-navbar { display: none !important; }
        #global-sidebar { display: none !important; }
        #global-footer { display: none !important; }
        #global-body { padding-top: 0 !important; background-color: #FCFBFA !important; }
        #global-main { max-width: 100% !important; padding: 0 !important; }
      `}} />
    </div>
  );
}
