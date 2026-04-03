import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('id', user.id)
      .maybeSingle();

    if (dbError) {
      console.error("Auth me DB Error:", dbError);
      throw new Error(dbError.message);
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        role: dbUser?.role || 'user',
        name: dbUser?.name || null,
        email: user.email || null,
      } 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
