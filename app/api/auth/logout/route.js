import { NextResponse } from 'next/server';
import { logoutUser } from '../../../../services/auth.service';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    // Back-compat: Authorization header logout
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      await logoutUser(token);
    } else {
      // Preferred: cookie-based logout
      const supabase = createSupabaseServerClient();
      await supabase.auth.signOut();
    }

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message || 'Logout failed' }, { status: 400 });
  }
}
