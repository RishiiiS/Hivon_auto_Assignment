import { createSupabaseServerClient } from '../lib/supabaseServer';

export async function getNotesByUser(userId) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('notes')
    .select('id, user_id, title, content, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error('Failed to fetch notes: ' + error.message);
  return data || [];
}

export async function createNoteForUser(userId, { title = '', content = '' }) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('notes')
    .insert([{ user_id: userId, title, content }])
    .select('id, user_id, title, content, created_at, updated_at')
    .single();

  if (error) throw new Error('Failed to create note: ' + error.message);
  return data;
}

export async function getNoteByIdForUser(userId, noteId) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('notes')
    .select('id, user_id, title, content, created_at, updated_at')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single();

  if (error) throw new Error('Note not found: ' + error.message);
  return data;
}

export async function updateNoteForUser(userId, noteId, { title, content }) {
  const supabase = await createSupabaseServerClient();

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;

  const { data, error } = await supabase
    .from('notes')
    .update(updateData)
    .eq('id', noteId)
    .eq('user_id', userId)
    .select('id, user_id, title, content, created_at, updated_at')
    .single();

  if (error) throw new Error('Failed to update note: ' + error.message);
  return data;
}

export async function deleteNoteForUser(userId, noteId) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId);

  if (error) throw new Error('Failed to delete note: ' + error.message);
  return true;
}
