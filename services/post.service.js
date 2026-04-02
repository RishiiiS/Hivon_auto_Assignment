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

function getUserNameFromJoin(joined) {
  const related = Array.isArray(joined) ? joined[0] : joined;
  return related?.name || null;
}

async function hydrateAuthorsForPosts(posts = []) {
  const missingAuthorIds = Array.from(
    new Set(
      (posts || [])
        .filter((p) => !getUserNameFromJoin(p?.users))
        .map((p) => p?.author_id)
        .filter(Boolean)
    )
  );

  if (missingAuthorIds.length === 0) return posts;

  const { data, error } = await supabase
    .from('users')
    .select('id, name, avatar_url')
    .in('id', missingAuthorIds);

  if (error || !data) return posts;

  const byId = new Map(data.map((u) => [String(u.id), u]));
  return (posts || []).map((p) => {
    const joinedName = getUserNameFromJoin(p?.users);
    if (joinedName) return { ...p, author_name: joinedName };

    const user = byId.get(String(p.author_id));
    if (!user) return p;

    return {
      ...p,
      author_name: user.name || null,
      author_avatar_url: user.avatar_url || null,
    };
  });
}

export async function getPosts({ limit = 10, offset = 0, authorId = null }) {
  const buildQuery = (select) => {
    let query = supabase
      .from('posts')
      .select(select, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (authorId) query = query.eq('author_id', authorId);
    return query;
  };

  // Prefer a lean payload for the feed; fall back to `*` if the DB schema differs.
  const preferredSelect = 'id, title, created_at, image_url, summary, author_id, users ( name )';
  const preferred = await buildQuery(preferredSelect);

  if (!preferred.error) {
    return {
      posts: await hydrateAuthorsForPosts(preferred.data),
      total: preferred.count,
    };
  }

  const fallback = await buildQuery('*, users ( name )');
  if (fallback.error) {
    throw new Error('Failed to fetch posts: ' + fallback.error.message);
  }

  return {
    posts: await hydrateAuthorsForPosts(fallback.data),
    total: fallback.count,
  };
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

  const joinedName = getUserNameFromJoin(data?.users);
  if (joinedName) return { ...data, author_name: joinedName };

  const { data: authorRow } = await supabase
    .from('users')
    .select('id, name, avatar_url')
    .eq('id', data.author_id)
    .maybeSingle();

  if (!authorRow) return data;

  return {
    ...data,
    author_name: authorRow.name || null,
    author_avatar_url: authorRow.avatar_url || null,
  };
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

  return await hydrateAuthorsForPosts(data);
}
