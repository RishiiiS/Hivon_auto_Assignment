import { createClient } from '@supabase/supabase-js';
import { supabaseAnon } from '../lib/supabaseAnonClient';

/**
 * Creates a scoped Supabase client with the user's JWT token.
 * This ensures API requests run in the context of the authenticated user
 * without polluting a global server instance.
 */
function getAuthClient(token) {
  if (!token) return supabaseAnon;
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    }
  );
}

export async function signupUser({ name, email, password }) {
  // 1. Create a new user using Supabase Auth
  const { data: authData, error: authError } = await supabaseAnon.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('Signup failed or requires email confirmation.');
  }

  // 2. Insert the user into the custom "users" table
  // We must use the authenticated session to insert into a table protected by RLS
  if (!authData.session) {
    throw new Error('Signup succeeded, but unable to create profile without an active session (e.g., waiting for email verification).');
  }

  const userClient = getAuthClient(authData.session.access_token);

  const { error: dbError } = await userClient
    .from('users')
    .insert([
      {
        id: authData.user.id,
        name: name,
        email: email,
        role: 'user',
      }
    ]);

  if (dbError) {
    console.error('Failed to create user profile, orphan auth user created:', authData.user.id);
    throw new Error('Account created but failed to save profile: ' + dbError.message);
  }

  return authData;
}

export async function loginUser({ email, password }) {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data; // contains user and session data
}

export async function logoutUser(token) {
  // 3. Invalidate user session
  // We use the scoped client so that Supabase knows WHICH session to sign out
  const client = getAuthClient(token);
  const { error } = await client.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return true;
}

export async function getCurrentUser(token) {
  // 4. Retrieve current session & fetch user data
  // We use getUser() to validate the JWT directly
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
  
  if (authError || !user) {
    throw new Error(authError?.message || 'Invalid or expired token');
  }

  // Fetch from the custom "users" table
  const { data: dbUser, error: dbError } = await supabaseAnon
    .from('users')
    .select('id, name, email, role, avatar_url')
    .eq('id', user.id)
    .single();

  if (dbError) {
    throw new Error('User profile not found: ' + dbError.message);
  }

  return { ...dbUser, avatar_url: dbUser.avatar_url || null };
}

export async function updateUserProfile(token, updates) {
  // Validate caller identity
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
  if (authError || !user) throw new Error('Unauthorized');

  // Must run on secured client
  const client = getAuthClient(token);

  // Update rows
  const { data, error } = await client
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update profile: ' + error.message);
  }

  return data;
}
