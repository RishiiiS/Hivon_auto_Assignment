import { NextResponse } from 'next/server';
import { signupUser } from '../../../../services/auth.service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // 1. Validate request body
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // 2. Delegate to service layer
    const authData = await signupUser({ name, email, password });

    return NextResponse.json({ 
      message: 'Signup successful',
      user: { id: authData.user.id, name, email, role: 'user' }
    }, { status: 201 });

  } catch (error) {
    if (error.message.toLowerCase().includes('already registered')) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
