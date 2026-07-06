'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { GoogleButton } from '@/components/auth/google-button';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'google_failed') {
      setError('Não foi possível entrar com Google. Tenta novamente.');
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Preenche o email e a palavra-passe.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken, refreshToken);
      router.push(user.role === 'ADMIN' ? '/dashboard' : '/donation');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao iniciar sessão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Entrar na conta</h2>
        <p className="text-sm text-muted-foreground">Acede à plataforma de doações</p>
        <Link href="/" className="mt-1 inline-block text-xs text-primary hover:underline">
          Voltar à página inicial
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@exemplo.com"
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Palavra-passe
            </label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Esqueceste-te?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-9 rounded-lg border border-input bg-background px-3 pr-10 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          Entrar
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">ou continua com</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton label="Entrar com Google" />

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tens conta?{' '}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Regista-te
        </Link>
      </p>
    </div>
  );
}
