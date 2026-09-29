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

export async function register(
  email: string,
  password: string,
  name: string,
): Promise<boolean> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (error) throw error;
  if (!data.user) throw new Error('User registration did not complete.');

  if (data.session) {
    useAuthStore.getState().setAuth(data.session.access_token, {
      id: data.user.id,
      email: data.user.email ?? email,
      name,
      role: data.user.user_metadata?.role ?? 'analyst',
    });
  }

  return !!data.session;
}

export async function loginWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/login` },
  });

  if (error) throw error;
}

export async function syncAuthSession(): Promise<boolean> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.user) return false;

  const user = data.session.user;
  useAuthStore.getState().setAuth(data.session.access_token, {
    id: user.id,
    email: user.email ?? '',
    name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? '',
    role: user.user_metadata?.role ?? 'analyst',
  });

  return true;
}

export async function logout(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Supabase logout failed:', error);
    }
  } finally {
    useAuthStore.getState().logout();
  }
}