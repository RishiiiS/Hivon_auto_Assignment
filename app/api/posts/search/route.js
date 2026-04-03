import { NextResponse } from 'next/server';
import { searchPosts } from '@/services/post.service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    // 2. Validate query is not empty
    if (!query || query.trim() === '') {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // 6. Optional limit and offset
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    // 3. Perform case-insensitive search using ILIKE on title and body
    // 4. Return: id, title, image_url, summary, author_id
    // 8. Performance: Do not return full body in search results
    const posts = await searchPosts(query.trim(), { limit, offset });

    return NextResponse.json({ 
      posts,
      limit,
      offset
    }, { status: 200 });

  } catch (error) {
    console.error('Search posts error:', error);
    // 7. Handle DB errors
    return NextResponse.json({ error: error.message || 'Failed to search posts' }, { status: 500 });
  }
}
