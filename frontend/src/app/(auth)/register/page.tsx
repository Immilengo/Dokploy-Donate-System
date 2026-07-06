'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { GoogleButton } from '@/components/auth/google-button';
import { Eye, EyeOff, Loader2, MailCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'google_failed') {
      setError('Não foi possível continuar com Google. Tenta novamente.');
    }
  }, []);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.fullName.trim().length < 3) return setError('O nome deve ter pelo menos 3 caracteres.');
    if (!form.email) return setError('O email é obrigatório.');
    if (form.password.length < 6) return setError('A palavra-passe deve ter pelo menos 6 caracteres.');
    if (form.password !== form.confirmPassword) return setError('As palavras-passe não coincidem.');

    setLoading(true);
    try {
      await authService.register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      setRegistered(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <MailCheck className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Verifica o teu email</h2>
        <p className="text-sm text-muted-foreground">
          Enviámos um link de verificação. Confirma o teu email antes de entrar na plataforma.
        </p>
        <Button variant="outline" className="mt-2" onClick={() => router.push('/login')}>
          Voltar ao login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Criar conta</h2>
        <p className="text-sm text-muted-foreground">Junta-te à Fundação Hubble e ajuda a doar</p>
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
          <label htmlFor="fullName" className="text-sm font-medium text-foreground">
            Nome completo
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="O teu nome"
            value={form.fullName}
            onChange={update('fullName')}
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="nome@exemplo.com"
            value={form.email}
            onChange={update('email')}
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">
            Telefone (opcional)
          </label>
          <input
            id="phone"
            type="text"
            placeholder="9XX XXX XXX"
            value={form.phone}
            onChange={update('phone')}
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Palavra-passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={update('password')}
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

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
            Confirmar palavra-passe
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 pr-10 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              aria-label={showConfirmPassword ? 'Ocultar confirmação da palavra-passe' : 'Mostrar confirmação da palavra-passe'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          Criar conta
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">ou regista-te com</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton label="Continuar com Google" />

      <p className="text-center text-sm text-muted-foreground">
        Já tens conta?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Entra
        </Link>
      </p>
    </div>
  );
}
