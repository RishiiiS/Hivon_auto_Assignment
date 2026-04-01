import { NextResponse } from 'next/server';
import { logoutUser } from '../../../../services/auth.service';

export async function POST(request) {
  try {
    // We expect the frontend to pass the JWT in the Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    await logoutUser(token);

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message || 'Logout failed' }, { status: 400 });
  }
}
