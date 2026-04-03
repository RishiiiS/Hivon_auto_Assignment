import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getSupabaseAdmin } from '@/lib/supabaseAdminClient';

async function verifyAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { error: 'Unauthorized', status: 401 };

  const supabaseAdmin = getSupabaseAdmin();
  const { data: checkUser, error: roleError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (roleError || checkUser?.role !== 'admin') {
    return { error: 'Forbidden', status: 403 };
  }

  return { supabaseAdmin, user: checkUser };
}

export async function GET(request) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });

    const { supabaseAdmin } = adminCheck;

    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, avatar_url, created_at')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ users }, { status: 200 });

  } catch (error) {
    console.error('Admin Users GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });

    const { supabaseAdmin } = adminCheck;
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and Role are required' }, { status: 400 });
    }

    if (!['user', 'admin'].includes(role)) {
       return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ message: 'User role updated', user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error('Admin Users PUT error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
