import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getCurrentUser } from '@/services/auth.service';

export async function getRequestUser(request) {
  // Back-compat: allow Bearer token if present
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const user = await getCurrentUser(token);
    if (!user) throw new Error('Unauthorized');
    return user;
  }

  // Preferred: cookie-based auth (Supabase SSR)
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error('Unauthorized');

  const { data: dbUser } = await supabase
    .from('users')
    .select('id, name, email, role, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  return {
    id: user.id,
    role: dbUser?.role || 'user',
    name: dbUser?.name || null,
    email: dbUser?.email || user.email || null,
    avatar_url: dbUser?.avatar_url || null,
  };
}

