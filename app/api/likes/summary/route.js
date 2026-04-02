import { NextResponse } from 'next/server';
import { getLikeSummary } from '../../../../services/postLike.service';
import { getCurrentUser } from '../../../../services/auth.service';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const post_id = searchParams.get('postId');

    if (!post_id) {
      return NextResponse.json({ error: 'postId query parameter is required' }, { status: 400 });
    }

    // Try to extract user from Authorization header to check if they liked it
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
    } else {
      // Cookie-based auth (optional)
      try {
        const supabase = createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) userId = user.id;
      } catch (e) {
        // Ignore
      }
    }

    const { count, liked } = await getLikeSummary(post_id, userId);
    return NextResponse.json({ count, liked }, { status: 200 });

  } catch (error) {
    console.error('Like summary error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch like summary' }, { status: 500 });
  }
}
