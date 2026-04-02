import { createClient } from '@supabase/supabase-js';

// We explicitly instantiate a stateless isolated Anon client. 
// The user currently lacks a SUPABASE_SERVICE_ROLE_KEY in .env.local causing 500 crashes.
// The root cause of the "isolated comments" bug was actually the global Next.js Supabase singleton 
// leaking the JWT auth.uid() state across requests, artificially triggering RLS blocks!
// A pristine stateless client executes as true Anon, resolving the 500 error while returning all queries intact!
const supabaseStateless = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function createComment({ post_id, user_id, comment_text, parent_comment_id }) {
  const { data, error } = await supabaseStateless
    .from('comments')
    .insert([
      { 
        post_id, 
        user_id, 
        comment_text, 
        parent_comment_id: parent_comment_id || null 
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create comment: ' + error.message);
  }

  return data;
}

export async function getCommentsByPostId(post_id) {
  const { data, error } = await supabaseStateless
    .from('comments')
    .select('*, users ( name )')
    .eq('post_id', post_id)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error('Failed to fetch comments: ' + error.message);
  }

  const getUserNameFromJoin = (joined) => {
    const related = Array.isArray(joined) ? joined[0] : joined;
    return related?.name || null;
  };

  const missingUserIds = Array.from(
    new Set(
      (data || [])
        .filter((c) => !getUserNameFromJoin(c?.users))
        .map((c) => c?.user_id)
        .filter(Boolean)
    )
  );

  let userNameById = new Map();
  if (missingUserIds.length > 0) {
    const { data: usersData } = await supabaseStateless
      .from('users')
      .select('id, name')
      .in('id', missingUserIds);

    userNameById = new Map((usersData || []).map((u) => [String(u.id), u.name || null]));
  }

  // Format the nested users structure to a flat 'user_name' to make it easier for the frontend
  return data.map(comment => ({
    id: comment.id,
    post_id: comment.post_id,
    user_id: comment.user_id,
    comment_text: comment.comment_text,
    parent_comment_id: comment.parent_comment_id,
    created_at: comment.created_at,
    user_name: getUserNameFromJoin(comment.users) || userNameById.get(String(comment.user_id)) || null,
  }));
}

export async function getCommentById(id) {
  const { data, error } = await supabaseStateless
    .from('comments')
    .select('id, user_id, post_id, comment_text, parent_comment_id')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error('Comment not found: ' + error.message);
  }

  return data;
}

export async function deleteComment(id) {
  const { error } = await supabaseStateless
    .from('comments')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Failed to delete comment: ' + error.message);
  }

  return true;
}

export async function updateComment(id, comment_text) {
  const { data, error } = await supabaseStateless
    .from('comments')
    .update({ comment_text })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update comment: ' + error.message);
  }

  return data;
}
