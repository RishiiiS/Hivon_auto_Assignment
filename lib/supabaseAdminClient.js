import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    'Missing Supabase admin env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined.'
  );
}

const globalForSupabaseAdmin = globalThis;

let supabaseAdmin = globalForSupabaseAdmin.supabaseAdmin;
if (!supabaseAdmin && supabaseUrl && serviceRoleKey) {
  try {
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (e) {
    console.error('Failed to initialize Supabase admin client:', e);
    supabaseAdmin = null;
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForSupabaseAdmin.supabaseAdmin = supabaseAdmin;
  }
}

export function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin not configured');
  }
  if (!supabaseAdmin) {
    throw new Error('Supabase admin not configured');
  }
  return supabaseAdmin;
}
