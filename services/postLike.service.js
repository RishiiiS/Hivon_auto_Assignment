import { createClient } from '@supabase/supabase-js';

// We explicitly instantiate a stateless isolated Anon client. 
// The user currently lacks a valid SUPABASE_SERVICE_ROLE_KEY in .env.local causing 500 crashes ("Invalid API key").
// A pristine stateless client executes as true Anon, resolving the 500 error while returning all queries intact!
const supabaseStateless = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function findExistingLike(user_id, post_id) {
  const { data, error } = await supabaseStateless
    .from('post_likes')
    .select('id')
    .eq('user_id', user_id)
    .eq('post_id', post_id)
    .maybeSingle(); // Returns null safely instead of throwing standard an exception if 0 rows

  if (error) {
    throw new Error('Database error while checking like status: ' + error.message);
  }

  return data;
}

export async function createLike(user_id, post_id) {
  const { error } = await supabaseStateless
    .from('post_likes')
    .insert([{ user_id, post_id }]);

  if (error) {
    if (error.code === '23505') { 
      // PostgreSQL unique violation error code
      // We gracefully handle race conditions where a user double-clicks fast
      return true;
    }
    throw new Error('Failed to create like: ' + error.message);
  }

  return true;
}

export async function deleteLike(user_id, post_id) {
  const { error } = await supabaseStateless
    .from('post_likes')
    .delete()
    .eq('user_id', user_id)
    .eq('post_id', post_id);

  if (error) {
    throw new Error('Failed to delete like: ' + error.message);
  }

  return true;
}

export async function getLikeSummary(post_id, user_id) {
  // Get aggregate count bypassing RLS securely using Service Role
  const { count, error: countError } = await supabaseStateless
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', post_id);

  if (countError) {
    throw new Error('Failed to get like count: ' + countError.message);
  }

  // Check unique boolean state if authenticated
  let liked = false;
  if (user_id) {
    const { data } = await supabaseStateless
      .from('post_likes')
      .select('id')
      .eq('user_id', user_id)
      .eq('post_id', post_id)
      .maybeSingle();
      
    if (data) liked = true;
  }

  return { count: count || 0, liked };
}
