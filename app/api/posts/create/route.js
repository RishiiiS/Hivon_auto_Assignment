import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { generateSummary } from '@/services/ai.service';

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
    const { title, body: postBody, image_url } = body;

    if (!title || !postBody) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const summary = await generateSummary(postBody);

    const { data: newPost, error: dbError } = await supabase
      .from('posts')
      .insert([
        {
          title,
          body: postBody,
          image_url: image_url || null,
          author_id: user.id,
          summary,
        }
      ])
      .select()
      .single();

    if (dbError) throw new Error(dbError.message);

    return NextResponse.json({ 
      message: 'Post created successfully',
      post: newPost 
    }, { status: 201 });

  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
