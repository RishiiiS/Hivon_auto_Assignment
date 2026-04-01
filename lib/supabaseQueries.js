import { supabase } from './supabaseClient';

/**
 * Example usage: Fetching the currently authenticated user
 * This works in both Server Components and Client Components
 * (Note: for SSR cookie-based auth in App Router, @supabase/ssr might be needed for secure session passing,
 * but this uses the standard supabase-js client as requested)
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error fetching current user:', error.message);
      return null;
    }
    
    return user;
  } catch (err) {
    console.error('Unexpected error fetching user:', err);
    return null;
  }
}

/**
 * Example usage: Fetching a user profile from a hypothetical 'profiles' table
 * Demonstrates a standard data fetch query
 * @param {string} userId - The ID of the user
 */
export async function fetchUserProfile(userId) {
  if (!userId) {
    throw new Error('userId is required');
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error fetching profile:', err);
    return null;
  }
}

/**
 * If you were to call these in a Client Component:
 *
 * "use client"
 * import { useEffect, useState } from 'react';
 * import { getCurrentUser, fetchUserProfile } from '@/lib/supabaseQueries';
 *
 * export default function ProfileInfo() {
 *   const [profile, setProfile] = useState(null);
 *   
 *   useEffect(() => {
 *     async function loadProfile() {
 *       const user = await getCurrentUser();
 *       if (user) {
 *         const data = await fetchUserProfile(user.id);
 *         setProfile(data);
 *       }
 *     }
 *     loadProfile();
 *   }, []);
 *   
 *   // render profile...
 * }
 */
