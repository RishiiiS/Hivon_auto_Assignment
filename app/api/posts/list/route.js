import { NextResponse } from 'next/server';
import { getPosts } from '../../../../services/post.service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    
    // 4. Add pagination (limit + offset)
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    const authorId = searchParams.get('authorId');

    // 4. Return: id, title, image_url, summary, author_id
    // 7. Do NOT call AI during fetch
    const { posts, total } = await getPosts({ limit, offset, authorId });
    console.log("FETCHED POSTS:", JSON.stringify(posts, null, 2));

    return NextResponse.json({ 
      posts,
      total,
      limit,
      offset
    }, { status: 200 });

  } catch (error) {
    console.error('List posts error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch posts' }, { status: 500 });
  }
}
