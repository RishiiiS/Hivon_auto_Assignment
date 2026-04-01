import { NextResponse } from 'next/server';
import { getCommentsByPostId } from '../../../../services/comment.service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const post_id = searchParams.get('post_id');
    
    if (!post_id) {
      return NextResponse.json({ error: 'post_id query parameter is required' }, { status: 400 });
    }

    // Fetches all threaded comments, joined with the flat author name dynamically
    const comments = await getCommentsByPostId(post_id);

    return NextResponse.json({ comments }, { status: 200 });

  } catch (error) {
    console.error('List comments error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch comments' }, { status: 500 });
  }
}
