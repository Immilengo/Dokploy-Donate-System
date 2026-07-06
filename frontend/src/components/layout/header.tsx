'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Menu, UserCircle } from 'lucide-react';

function initials(name?: string) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

const adminLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/donation', label: 'Doações' },
  { href: '/collection-points', label: 'Pontos de recolha' },
  { href: '/users', label: 'Utilizadores' },
  { href: '/profile', label: 'Perfil' },
];

const userLinks = [
  { href: '/donation', label: 'As minhas doações' },
  { href: '/profile', label: 'Perfil' },
];

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const pathname = usePathname();
  const links = user?.role === 'ADMIN' ? adminLinks : userLinks;

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="Menu" className="inline-flex items-center justify-center rounded-lg p-2 text-foreground hover:bg-muted md:hidden">
            <Menu className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" className="w-44 md:hidden">
            {links.map((link) => (
              <DropdownMenuItem
                key={link.href}
                onClick={() => router.push(link.href)}
                className={pathname === link.href ? 'font-semibold' : ''}
              >
                {link.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="hidden font-semibold text-foreground md:block">Fundação Hubble</div>
      </div>
      <div className="hidden md:block" />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1 outline-none hover:bg-muted">
          <Avatar size="sm">
            <AvatarFallback>{initials(user?.fullName)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground sm:inline">{user?.fullName}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className="space-y-0.5">
                <span className="block text-sm font-semibold text-foreground">{user?.fullName}</span>
                <span className="block text-xs text-muted-foreground">{user?.email}</span>
                <span className="block text-xs text-muted-foreground">{user?.role === 'ADMIN' ? 'Administrador' : 'Utilizador'}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <UserCircle className="h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Terminar sessão
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}