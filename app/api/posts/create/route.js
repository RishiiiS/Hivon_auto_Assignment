import { NextResponse } from 'next/server';
import { getRequestUser } from '../../../../services/requestUser.service';
import { generateSummary } from '../../../../services/ai.service';
import { createPost } from '../../../../services/post.service';

export async function POST(request) {
  try {
    // 1. Authenticate user and get user.id (Security: Always extract user from token)
    let user;
    try {
      user = await getRequestUser(request);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
    }

    const body = await request.json();
    const { title, body: postBody, image_url } = body;

    // 8. Handle missing fields
    if (!title || !postBody) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    // 2 & 5. Call AI service to generate a ~200 word summary from body using Gemini API
    // 7. Generate summary ONLY during creation
    const summary = await generateSummary(postBody);

    // 3. Insert into "posts" table (Summary stored in DB)
    const newPost = await createPost({
      title,
      body: postBody,
      image_url: image_url || null,
      author_id: user.id, // 6. Do NOT trust frontend for author_id
      summary,
    });

    // 4. Return created post
    return NextResponse.json({ 
      message: 'Post created successfully',
      post: newPost 
    }, { status: 201 });

  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
