import { create } from 'zustand';

// Shape mínimo garantido pelo backend no login/register
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  hydrated: false,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, accessToken, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.clear();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    const userRaw = localStorage.getItem('user');
    if (token && userRaw) {
      set({ accessToken: token, user: JSON.parse(userRaw), isAuthenticated: true });
    }
    set((state) => ({ ...state, hydrated: true }));
  },
}));