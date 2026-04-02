import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  deleteNoteForUser,
  getNoteByIdForUser,
  updateNoteForUser,
} from '../../../../services/note.service';
import { getRequestUser } from '../../../../services/requestUser.service';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

function getBearerToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
}

function getSupabaseForRequest(token) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error('Supabase not configured');
  if (token) {
    return createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return createSupabaseServerClient();
}

export async function GET(request, context) {
  try {
    const token = getBearerToken(request);
    const user = await getRequestUser(request);

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });

    try {
      const note = await getNoteByIdForUser(user.id, id);
      return NextResponse.json({ note }, { status: 200 });
    } catch (e) {
      if (e?.message !== 'Supabase admin not configured') throw e;
      const supabase = getSupabaseForRequest(token);
      const { data, error } = await supabase
        .from('notes')
        .select('id, user_id, title, content, created_at, updated_at')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      if (error) throw new Error('Note not found: ' + error.message);
      return NextResponse.json({ note: data }, { status: 200 });
    }
  } catch (error) {
    console.error('Note GET error:', error);
    if (error.message.startsWith('Note not found')) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: error.message || 'Failed to fetch note' }, { status });
  }
}

export async function PUT(request, context) {
  try {
    const token = getBearerToken(request);
    const user = await getRequestUser(request);

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });

    const body = await request.json();
    const { title, content } = body || {};

    try {
      const note = await updateNoteForUser(user.id, id, { title, content });
      return NextResponse.json({ note }, { status: 200 });
    } catch (e) {
      if (e?.message !== 'Supabase admin not configured') throw e;
      const supabase = getSupabaseForRequest(token);
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      const { data, error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id, user_id, title, content, created_at, updated_at')
        .single();
      if (error) throw new Error('Failed to update note: ' + error.message);
      return NextResponse.json({ note: data }, { status: 200 });
    }
  } catch (error) {
    console.error('Note PUT error:', error);
    if (error.message.startsWith('Failed to update note')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: error.message || 'Failed to update note' }, { status });
  }
}

export async function DELETE(request, context) {
  try {
    const token = getBearerToken(request);
    const user = await getRequestUser(request);

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });

    try {
      await deleteNoteForUser(user.id, id);
      return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 });
    } catch (e) {
      if (e?.message !== 'Supabase admin not configured') throw e;
      const supabase = getSupabaseForRequest(token);
      const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw new Error('Failed to delete note: ' + error.message);
      return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 });
    }
  } catch (error) {
    console.error('Note DELETE error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: error.message || 'Failed to delete note' }, { status });
  }
}
