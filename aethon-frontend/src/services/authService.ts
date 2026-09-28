import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export async function login(
  email: string,
  password: string,
): Promise<void> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.session || !data.user) {
    throw new Error('Authentication session was not created.');
  }

  const user = data.user;

  useAuthStore.getState().setAuth(
    data.session.access_token,
    {
      id: user.id,
      email: user.email ?? email,
      name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email ??
        email,
      role:
        user.user_metadata?.role ??
        'analyst',
    },
  );
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();

  useAuthStore.getState().logout();
}