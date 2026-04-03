import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message || 'Invalid login credentials' }, { status: 401 });
    }

    return NextResponse.json({ 
      message: 'Login successful',
      session,
      user
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message || 'Invalid login credentials' }, { status: 401 });
  }
}
