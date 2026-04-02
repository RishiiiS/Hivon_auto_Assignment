import { supabase } from '../lib/supabaseClient';

export async function createPost({ title, body, image_url, author_id, summary }) {
  // We use the generic server client because RLS for inserting posts usually checks author_id, 
  // or we could use the scoped client. The requirement requested: "Extract user from token... Do NOT trust frontend for author_id".
  // Assuming the user's role allows inserting, and we supply the author_id fetched securely.
  const { data, error } = await supabase
    .from('posts')
    .insert([
      { title, body, image_url, author_id, summary }
    ])
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create post: ' + error.message);
  }

  return data;
}

export async function getPosts({ limit = 10, offset = 0, authorId = null }) {
  let query = supabase
    .from('posts')
    .select('*, users ( name )', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (authorId) {
    query = query.eq('author_id', authorId);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error('Failed to fetch posts: ' + error.message);
  }

  return { posts: data, total: count };
}

export async function getPostById(id) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, users ( name )')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error('Post not found: ' + error.message);
  }

  return data;
}

export async function updatePost(id, data) {
  const { error } = await supabase
    .from('posts')
    .update(data)
    .eq('id', id);

  if (error) {
    throw new Error('Failed to update post: ' + error.message);
  }

  return true;
}

export async function deletePost(id) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Failed to delete post: ' + error.message);
  }

  return true;
}

export async function searchPosts(query, { limit = 10, offset = 0 }) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, users ( name )')
    .or(`title.ilike.%${query}%,body.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error('Failed to search posts: ' + error.message);
  }

  return data;
}

