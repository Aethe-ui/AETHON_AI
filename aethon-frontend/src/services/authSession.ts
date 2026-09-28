import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export async function restoreAuthSession(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    useAuthStore.getState().logout();
    return;
  }

  const user = session.user;

  useAuthStore.getState().setAuth(
    session.access_token,
    {
      id: user.id,
      email: user.email ?? '',
      name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email ??
        '',
      role:
        user.user_metadata?.role ??
        'analyst',
    },
  );
}