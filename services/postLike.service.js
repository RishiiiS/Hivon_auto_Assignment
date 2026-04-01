import { supabase } from '../lib/supabaseClient';

export async function findExistingLike(user_id, post_id) {
  const { data, error } = await supabase
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
  const { error } = await supabase
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
  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('user_id', user_id)
    .eq('post_id', post_id);

  if (error) {
    throw new Error('Failed to delete like: ' + error.message);
  }

  return true;
}
