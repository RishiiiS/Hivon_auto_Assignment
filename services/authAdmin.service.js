import { getSupabaseAdmin } from '../lib/supabaseAdminClient';

export async function getCurrentUserAdmin(token) {
  if (!token) throw new Error('Unauthorized');

  const supabaseAdmin = getSupabaseAdmin();
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !authData?.user) throw new Error('Unauthorized');

  const userId = authData.user.id;

  const { data: dbUser, error: dbError } = await supabaseAdmin
    .from('users')
    .select('id, name, email, role, avatar_url')
    .eq('id', userId)
    .single();

  if (dbError) {
    return { id: userId, role: 'user', name: null, email: null, avatar_url: null };
  }

  return {
    id: dbUser.id,
    name: dbUser.name || null,
    email: dbUser.email || null,
    role: dbUser.role || 'user',
    avatar_url: dbUser.avatar_url || null,
  };
}
