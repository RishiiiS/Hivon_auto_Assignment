import { NextResponse } from 'next/server';
import { updateUserProfile } from '../../../../services/auth.service';
import { getRequestUser } from '../../../../services/requestUser.service';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function PUT(request) {
  try {
    // Parse the fields
    const body = await request.json();
    const { avatar_url } = body;

    if (!avatar_url) {
      return NextResponse.json({ error: 'avatar_url is missing' }, { status: 400 });
    }

    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const updated = await updateUserProfile(token, { avatar_url });
      return NextResponse.json({ message: 'Profile updated!', user: updated }, { status: 200 });
    }

    const user = await getRequestUser(request);
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('users')
      .update({ avatar_url })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update profile: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile updated!', user: data }, { status: 200 });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
