import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../../services/auth.service';
import { getCommentById, deleteComment } from '../../../../../services/comment.service';

export async function DELETE(request, context) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    
    // Identify requesting user securely via JWT
    let user;
    try {
      user = await getCurrentUser(token);
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
