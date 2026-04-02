import { NextResponse } from 'next/server';
import { updateUserProfile } from '../../../../services/auth.service';

export async function PUT(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    
    // Parse the fields
    const body = await request.json();
    const { avatar_url } = body;

    if (!avatar_url) {
      return NextResponse.json({ error: 'avatar_url is missing' }, { status: 400 });
    }

    const updated = await updateUserProfile(token, { avatar_url });

    return NextResponse.json({ message: 'Profile updated!', user: updated }, { status: 200 });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
