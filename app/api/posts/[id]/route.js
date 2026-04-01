import { NextResponse } from 'next/server';
import { getPostById, updatePost, deletePost } from '../../../../services/post.service';
import { getCurrentUser } from '../../../../services/auth.service';

export async function GET(request, context) {
  try {
    // Await params to support both Next.js 14 and 15 safely
    const { id } = await context.params;

    if (!id) {
       return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // 5. Return full post: title, body, image_url, summary, author_id
    // 7. Do NOT call AI during fetch
    const post = await getPostById(id);

    return NextResponse.json({ post }, { status: 200 });

  } catch (error) {
    console.error('Get post error:', error);
    if (error.message.includes('not found') || error.message.includes('contains no rows')) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    
    // 2. Extract user & Authenticate
    let user;
    try {
      user = await getCurrentUser(token);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });

    const body = await request.json();
    const { title, body: postBody, image_url } = body;

    // 3. Fetch post by id
    let post;
    try {
      post = await getPostById(id);
    } catch (err) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // RBAC check
    if (post.author_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to edit this post' }, { status: 403 });
    }

    // Allow updating title, body, image_url
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (postBody !== undefined) updateData.body = postBody;
    if (image_url !== undefined) updateData.image_url = image_url;

    if (Object.keys(updateData).length > 0) {
      await updatePost(id, updateData);
    }

    return NextResponse.json({ message: 'Post updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    
    // Authenticate
    let user;
    try {
      user = await getCurrentUser(token);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });

    // Fetch post by id
    let post;
    try {
      post = await getPostById(id);
    } catch (err) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // RBAC check
    if (post.author_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to delete this post' }, { status: 403 });
    }

    await deletePost(id);

    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete post' }, { status: 500 });
  }
}
