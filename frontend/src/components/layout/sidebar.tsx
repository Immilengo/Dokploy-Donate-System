'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { LayoutDashboard, HeartHandshake, MapPin, Users, UserCircle } from 'lucide-react';

const adminLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/donation', label: 'Doações', icon: HeartHandshake },
  { href: '/collection-points', label: 'Pontos de recolha', icon: MapPin },
  { href: '/users', label: 'Utilizadores', icon: Users },
  { href: '/profile', label: 'Perfil', icon: UserCircle },
];

const userLinks = [
  { href: '/donation', label: 'As minhas doações', icon: HeartHandshake },
  { href: '/profile', label: 'Perfil', icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const links = user?.role === 'ADMIN' ? adminLinks : userLinks;

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-background md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
          H
        </div>
        <span className="text-sm font-semibold text-foreground">Fundação Hubble</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => {
          const active = pathname === link.href || pathname?.startsWith(link.href + '/');
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}