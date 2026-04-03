import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function DELETE(request, context) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });

    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      throw new Error(fetchError.message);
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: deleteError } = await supabase.from('comments').delete().eq('id', id);
    if (deleteError) throw new Error(deleteError.message);

    return NextResponse.json({ message: 'Comment deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete comment' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });

    const body = await request.json();
    const { comment_text } = body;

    if (!comment_text || !comment_text.trim()) {
       return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
    }

    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      throw new Error(fetchError.message);
    }

    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (comment.user_id !== user.id && dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('comments')
      .update({ comment_text: comment_text.trim() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ message: 'Comment updated successfully', comment: updated }, { status: 200 });

  } catch (error) {
    console.error('Update comment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update comment' }, { status: 500 });
  }
}
