import { NextResponse } from 'next/server';
import { getRequestUser } from '../../../../services/requestUser.service';
import { getPostById } from '../../../../services/post.service';
import { createLike, deleteLike, findExistingLike } from '../../../../services/postLike.service';

export async function POST(request) {
  try {
    let user;
    try {
      user = await getRequestUser(request);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    // Validate post exists
    try {
      await getPostById(postId);
    } catch (err) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Toggle logic: If like exists -> delete, Else -> insert
    const existing = await findExistingLike(user.id, postId);

    if (existing) {
      await deleteLike(user.id, postId);
      return NextResponse.json({ message: 'Post unliked successfully', liked: false }, { status: 200 });
    } else {
      await createLike(user.id, postId);
      return NextResponse.json({ message: 'Post liked successfully', liked: true }, { status: 201 });
    }

  } catch (error) {
    console.error('Like toggle error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
