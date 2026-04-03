import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getSupabaseAdmin } from '@/lib/supabaseAdminClient';

export async function GET(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const supabaseAdmin = getSupabaseAdmin();
    const { data: checkUser, error: roleError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (roleError || checkUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch stats
    const { count: userCount } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: postCount } = await supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact', head: true });

    const { count: commentCount } = await supabaseAdmin
      .from('comments')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      users: userCount || 0,
      posts: postCount || 0,
      comments: commentCount || 0,
    }, { status: 200 });

  } catch (error) {
    console.error('Admin Stats error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
