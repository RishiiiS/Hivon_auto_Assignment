import { supabase } from '../lib/supabaseClient';

export async function createComment({ post_id, user_id, comment_text, parent_comment_id }) {
  const { data, error } = await supabase
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
  // Fetch comments including user info (name)
  // The !inner ensures we only get comments where the user exists, and we select just the name
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      post_id,
      user_id,
      comment_text,
      parent_comment_id,
      created_at,
      users!inner (name)
    `)
    .eq('post_id', post_id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch comments: ' + error.message);
  }

  // Format the nested users structure to a flat 'user_name' to make it easier for the frontend
  return data.map(comment => ({
    id: comment.id,
    post_id: comment.post_id,
    user_id: comment.user_id,
    comment_text: comment.comment_text,
    parent_comment_id: comment.parent_comment_id,
    created_at: comment.created_at,
    user_name: comment.users?.name,
  }));
}

export async function getCommentById(id) {
  const { data, error } = await supabase
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
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Failed to delete comment: ' + error.message);
  }

  return true;
}
