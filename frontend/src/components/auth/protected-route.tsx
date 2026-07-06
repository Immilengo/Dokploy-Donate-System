'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loading } from '@/components/shared/loading';

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: ('USER' | 'ADMIN')[];
}) {
  const router = useRouter();
  const { user, isAuthenticated, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace(user.role === 'ADMIN' ? '/dashboard' : '/donation');
    }
  }, [hydrated, isAuthenticated, user, allowedRoles, router]);

  const blocked = !hydrated || !isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role));

  if (blocked) {
    return <Loading />;
  }

  return <>{children}</>;
}