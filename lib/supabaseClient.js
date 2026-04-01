import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined.');
  } else {
    console.warn('Missing Supabase environment variables on server: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined.');
  }
}

// Ensure a single instance across hot reloads in development and use it for both client/server safely
// The JS SDK createClient works cleanly in Next.js when we avoid recreating it.
const globalForSupabase = globalThis;

let supabaseClient;
if (!globalForSupabase.supabaseClient) {
  supabaseClient = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
      persistSession: typeof window !== 'undefined',
      autoRefreshToken: typeof window !== 'undefined',
      detectSessionInUrl: typeof window !== 'undefined',
    },
  });
  
  if (process.env.NODE_ENV !== 'production') {
    globalForSupabase.supabaseClient = supabaseClient;
  }
} else {
  supabaseClient = globalForSupabase.supabaseClient;
}

export const supabase = supabaseClient;
