import { NextResponse } from 'next/server';
import { getRequestUser } from '@/services/requestUser.service';
import { getPostById } from '@/services/post.service';
import { findExistingLike, createLike, deleteLike } from '@/services/postLike.service';

export async function POST(request) {
  try {
    // 1. Extract and validate JWT token
    // 2. Get logged-in user securely
    let user;
    try {
      user = await getRequestUser(request);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { post_id } = body;

    // 5. Handle missing post_id
    if (!post_id) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
    }

    // 3. Validate post_id exists
    try {
      await getPostById(post_id);
    } catch (err) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 4. Check if like already exists securely mapped to the requesting user
    const existingLike = await findExistingLike(user.id, post_id);

    if (existingLike) {
      // 5. If like exists: Delete the like (unlike)
      await deleteLike(user.id, post_id);
      return NextResponse.json({
        liked: false,
        message: "Post unliked"
      }, { status: 200 });
    } else {
      // 6. If like does NOT exist: Insert into post_likes
      await createLike(user.id, post_id);
      return NextResponse.json({
        liked: true,
        message: "Post liked"
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Toggle like error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
