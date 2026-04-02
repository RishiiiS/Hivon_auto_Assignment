import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../services/auth.service';
import { getLikeSummaries } from '../../../../services/postLike.service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postIdsRaw = searchParams.get('postIds') || '';

    const postIds = postIdsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (postIds.length === 0) {
      return NextResponse.json({ error: 'postIds query parameter is required' }, { status: 400 });
    }

    if (postIds.length > 50) {
      return NextResponse.json(
        { error: 'Too many postIds (max 50)' },
        { status: 400 }
      );
    }

    // Optional auth for liked status
    let userId = null;
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const user = await getCurrentUser(token);
        if (user) userId = user.id;
      } catch (e) {
        // Ignore invalid tokens for public read access
      }
    }

    const { countsByPostId, likedByPostId } = await getLikeSummaries(postIds, userId);
    return NextResponse.json(
      { countsByPostId, likedByPostId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Like summary batch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch like summaries' },
      { status: 500 }
    );
  }
}

