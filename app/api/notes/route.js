import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getNotesByUser, createNoteForUser } from '@/services/note.service';

export async function GET(request) {
  try {
    const supabaseShared = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabaseShared.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Using service (admin client) ensures it works even if RLS is not configured,
    // while we've already verified the user via cookies above.
    const notes = await getNotesByUser(user.id);
    return NextResponse.json({ notes: notes || [] }, { status: 200 });
    
  } catch (error) {
    console.error('Notes GET error:', error);
    const status = error.message.includes('not configured') ? 503 : 500;
    return NextResponse.json({ error: error.message || 'Failed to fetch notes' }, { status });
  }
}

export async function POST(request) {
  try {
    const supabaseShared = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabaseShared.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title = '', content = '' } = body || {};

    const note = await createNoteForUser(user.id, { title, content });
    return NextResponse.json({ note }, { status: 201 });
    
  } catch (error) {
    console.error('Notes POST error:', error);
    const status = error.message.includes('not configured') ? 503 : 500;
    return NextResponse.json({ error: error.message || 'Failed to create note' }, { status });
  }
}
