import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { 
  getNoteByIdForUser, 
  updateNoteForUser, 
  deleteNoteForUser 
} from '@/services/note.service';

export async function GET(request, context) {
  try {
    const supabaseShared = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabaseShared.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });

    const note = await getNoteByIdForUser(user.id, id);
    return NextResponse.json({ note }, { status: 200 });
    
  } catch (error) {
    console.error('Note GET error:', error);
    if (error.message.includes('Note not found')) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    const status = error.message.includes('not configured') ? 503 : 
                   (error.message === 'Unauthorized' ? 401 : 500);
    return NextResponse.json({ error: error.message || 'Failed to fetch note' }, { status });
  }
}

export async function PUT(request, context) {
  try {
    const supabaseShared = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabaseShared.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });

    const body = await request.json();
    const { title, content } = body || {};

    const note = await updateNoteForUser(user.id, id, { title, content });
    return NextResponse.json({ note }, { status: 200 });
    
  } catch (error) {
    console.error('Note PUT error:', error);
    const status = error.message.includes('not configured') ? 503 : 
                   (error.message === 'Unauthorized' ? 401 : 500);
    return NextResponse.json({ error: error.message || 'Failed to update note' }, { status });
  }
}

export async function DELETE(request, context) {
  try {
    const supabaseShared = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabaseShared.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });

    await deleteNoteForUser(user.id, id);
    return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 });
    
  } catch (error) {
    console.error('Note DELETE error:', error);
    const status = error.message.includes('not configured') ? 503 : 
                   (error.message === 'Unauthorized' ? 401 : 500);
    return NextResponse.json({ error: error.message || 'Failed to delete note' }, { status });
  }
}
