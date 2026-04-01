import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../services/auth.service';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Retrieves existing user data directly from the JWT, then supplements with database lookup
    const userProfile = await getCurrentUser(token);

    return NextResponse.json({ 
      user: userProfile
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
