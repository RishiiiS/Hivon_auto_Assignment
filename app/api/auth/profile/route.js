import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function PUT(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { avatar_url } = body;

    if (!avatar_url) {
      return NextResponse.json({ error: 'avatar_url is missing' }, { status: 400 });
    }

    const { data, error: dbError } = await supabase
      .from('users')
      .update({ avatar_url })
      .eq('id', user.id)
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: 'Failed to update profile: ' + dbError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile updated!', user: data }, { status: 200 });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
