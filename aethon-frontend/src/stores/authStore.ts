import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: { email: string; name: string; role: string } | null;
  setAuth: (token: string, user: { email: string; name: string; role: string }) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'aethon-auth',
      storage: createJSONStorage(() => sessionStorage), // §8.2: sessionStorage for security tools
    }
  )
);
