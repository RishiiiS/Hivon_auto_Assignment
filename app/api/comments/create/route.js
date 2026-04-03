import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { post_id, comment_text, parent_comment_id } = body;

    if (!post_id) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
    }
    if (!comment_text || comment_text.trim().length === 0) {
      return NextResponse.json({ error: 'comment_text cannot be empty' }, { status: 400 });
    }

    const { data: newComment, error: insertError } = await supabase
      .from('comments')
      .insert([
        {
          post_id,
          user_id: user.id,
          comment_text,
          parent_comment_id: parent_comment_id || null,
        }
      ])
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return NextResponse.json({ 
      message: 'Comment created successfully',
      comment: newComment 
    }, { status: 201 });

  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
