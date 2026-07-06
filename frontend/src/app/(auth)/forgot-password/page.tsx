'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authService.forgotPassword(email);
    } finally {
      setLoading(false);
      setSent(true); // resposta do backend é sempre genérica, mesmo que o email não exista
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Verifica o teu email</h2>
        <p className="text-sm text-muted-foreground">
          Se o email existir na nossa base de dados, vais receber um link para redefinir a palavra-passe.
        </p>
        <Button variant="outline" className="mt-2" render={<Link href="/login" />}>
          Voltar ao login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Recuperar palavra-passe</h2>
        <p className="text-sm text-muted-foreground">Enviamos-te um link para criares uma nova palavra-passe</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="nome@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          Enviar link
        </Button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar ao login
      </Link>
    </div>
  );
}