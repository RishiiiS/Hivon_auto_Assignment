import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getPostById } from '@/services/post.service';

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });

    // Using the service ensures we get the same hydration logic (author_name, etc.)
    // and use the anon client which we know can read posts.
    const post = await getPostById(id);
    return NextResponse.json({ post }, { status: 200 });

  } catch (error) {
    console.error('Get post error:', error);
    if (error.message.includes('not found')) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch post' }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });

    const body = await request.json();
    const { title, body: postBody, image_url } = body;

    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      throw new Error(fetchError.message);
    }

    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (post.author_id !== user.id && dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (postBody !== undefined) updateData.body = postBody;
    if (image_url !== undefined) updateData.image_url = image_url;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase.from('posts').update(updateData).eq('id', id);
      if (updateError) throw new Error(updateError.message);
    }

    return NextResponse.json({ message: 'Post updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update post' }, { status: 500 });
  }
}

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
    if (!id) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });

    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      throw new Error(fetchError.message);
    }

    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (post.author_id !== user.id && dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: deleteError } = await supabase.from('posts').delete().eq('id', id);
    if (deleteError) throw new Error(deleteError.message);

    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete post' }, { status: 500 });
  }
}
