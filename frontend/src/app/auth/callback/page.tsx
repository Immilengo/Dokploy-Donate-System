'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { Loading } from '@/components/shared/loading';

function GoogleCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const error = params.get('error');
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (error || !accessToken || !refreshToken) {
      router.replace('/login?error=google_failed');
      return;
    }

    (async () => {
      try {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        const me = await authService.me();
        const user = me.data;

        setAuth(
          {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          },
          accessToken,
          refreshToken
        );

        router.replace(user.role === 'ADMIN' ? '/dashboard' : '/donation');
      } catch {
        localStorage.clear();
        router.replace('/login?error=google_failed');
      }
    })();
  }, [params, router, setAuth]);

  return <Loading label="A concluir o login com Google..." />;
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<Loading label="A concluir o login com Google..." />}>
      <GoogleCallbackInner />
    </Suspense>
  );
}
