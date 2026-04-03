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
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    // Toggle logic: If like exists -> delete, Else -> insert
    const { data: existing, error: findError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .maybeSingle();

    if (findError) throw new Error(findError.message);

    if (existing) {
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);
        
      if (deleteError) throw new Error(deleteError.message);
      
      return NextResponse.json({ message: 'Post unliked successfully', liked: false }, { status: 200 });
    } else {
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert([{ user_id: user.id, post_id: postId }]);
        
      if (insertError) throw new Error(insertError.message);
      
      return NextResponse.json({ message: 'Post liked successfully', liked: true }, { status: 201 });
    }

  } catch (error) {
    console.error('Like toggle error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
