import { NextResponse } from 'next/server';
import { getRequestUser } from '../../../../services/requestUser.service';
import { getCommentById, deleteComment, updateComment } from '../../../../services/comment.service';

export async function DELETE(request, context) {
  try {
    // Identify requesting user securely via JWT
    let user;
    try {
      user = await getRequestUser(request);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
       return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    // Fetch comment by id
    let comment;
    try {
      comment = await getCommentById(id);
    } catch (err) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Rule: Allow delete only if comment.user_id === loggedInUser.id
    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own comments' }, { status: 403 });
    }

    await deleteComment(id);

    return NextResponse.json({ message: 'Comment deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete comment' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    let user;
    try {
      user = await getRequestUser(request);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
       return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { comment_text } = body;

    if (!comment_text || !comment_text.trim()) {
       return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
    }

    let comment;
    try {
      comment = await getCommentById(id);
    } catch (err) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Role Matrix Validation
    // Users can only edit if they are the original author or an admin
    const isAuthor = comment.user_id === user.id;
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to edit this comment' }, { status: 403 });
    }

    const updated = await updateComment(id, comment_text.trim());

    return NextResponse.json({ message: 'Comment updated successfully', comment: updated }, { status: 200 });

  } catch (error) {
    console.error('Update comment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update comment' }, { status: 500 });
  }
}
