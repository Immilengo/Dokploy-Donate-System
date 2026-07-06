'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';

export function useAuth() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, hydrated, hydrate, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignora erro do backend — limpamos a sessão localmente de qualquer forma
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return { user, accessToken, isAuthenticated, hydrated, logout };
}