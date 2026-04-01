import { NextResponse } from 'next/server';
import { getPostById } from '../../../../services/post.service';

export async function GET(request, context) {
  try {
    // Await params to support both Next.js 14 and 15 safely
    const { id } = await context.params;

    if (!id) {
       return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // 5. Return full post: title, body, image_url, summary, author_id
    // 7. Do NOT call AI during fetch
    const post = await getPostById(id);

    return NextResponse.json({ post }, { status: 200 });

  } catch (error) {
    console.error('Get post error:', error);
    if (error.message.includes('not found') || error.message.includes('contains no rows')) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch post' }, { status: 500 });
  }
}
