import apiClient from './apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import { useAuthStore } from '@/stores/authStore';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export async function login(email: string, password: string): Promise<void> {
  if (useMock) {
    // Mock login: any credentials work
    await new Promise((r) => setTimeout(r, 500));
    useAuthStore.getState().setAuth('mock-jwt-token-aethon', {
      email,
      name: 'Sarah Chen',
      role: 'analyst',
    });
    return;
  }
  const { data } = await apiClient.post(ENDPOINTS.AUTH_LOGIN, { email, password });
  useAuthStore.getState().setAuth(data.token, data.user);
}

export function logout(): void {
  useAuthStore.getState().logout();
}
