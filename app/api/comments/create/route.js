import { NextResponse } from 'next/server';
import { getRequestUser } from '../../../../services/requestUser.service';
import { getPostById } from '../../../../services/post.service';
import { createComment } from '../../../../services/comment.service';

export async function POST(request) {
  try {
    // 5. Always extract from token
    let user;
    try {
      user = await getRequestUser(request);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { post_id, comment_text, parent_comment_id } = body;

    if (!post_id) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
    }
    if (!comment_text || comment_text.trim().length === 0) {
      return NextResponse.json({ error: 'comment_text cannot be empty' }, { status: 400 });
    }

    // Validate post exists
    try {
      await getPostById(post_id);
    } catch (err) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const newComment = await createComment({
      post_id,
      user_id: user.id, // Never trust user_id from frontend
      comment_text,
      parent_comment_id: parent_comment_id || null,
    });

    return NextResponse.json({ 
      message: 'Comment created successfully',
      comment: newComment 
    }, { status: 201 });

  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
