import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUserAdmin } from '../../../services/authAdmin.service';
import { createNoteForUser, getNotesByUser } from '../../../services/note.service';
import { getCurrentUser } from '../../../services/auth.service';

function getBearerToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
}

function getScopedSupabase(token) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error('Supabase not configured');
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(request) {
  try {
    const token = getBearerToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });

    try {
      const user = await getCurrentUserAdmin(token);
      const notes = await getNotesByUser(user.id);
      return NextResponse.json({ notes }, { status: 200 });
    } catch (e) {
      if (e?.message !== 'Supabase admin not configured') throw e;
      const user = await getCurrentUser(token);
      const supabase = getScopedSupabase(token);
      const { data, error } = await supabase
        .from('notes')
        .select('id, user_id, title, content, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw new Error('Failed to fetch notes: ' + error.message);
      return NextResponse.json({ notes: data || [] }, { status: 200 });
    }
  } catch (error) {
    console.error('Notes GET error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: error.message || 'Failed to fetch notes' }, { status });
  }
}

export async function POST(request) {
  try {
    const token = getBearerToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });

    const body = await request.json();
    const { title = '', content = '' } = body || {};

    try {
      const user = await getCurrentUserAdmin(token);
      const note = await createNoteForUser(user.id, { title, content });
      return NextResponse.json({ note }, { status: 201 });
    } catch (e) {
      if (e?.message !== 'Supabase admin not configured') throw e;
      const user = await getCurrentUser(token);
      const supabase = getScopedSupabase(token);
      const { data, error } = await supabase
        .from('notes')
        .insert([{ user_id: user.id, title, content }])
        .select('id, user_id, title, content, created_at, updated_at')
        .single();
      if (error) throw new Error('Failed to create note: ' + error.message);
      return NextResponse.json({ note: data }, { status: 201 });
    }
  } catch (error) {
    console.error('Notes POST error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: error.message || 'Failed to create note' }, { status });
  }
}
