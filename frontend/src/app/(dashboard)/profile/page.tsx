'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { donationService } from '@/services/donations.service';
import { User } from '@/types';
import { PageHeader } from '@/components/layout/page-header';
import { Loading } from '@/components/shared/loading';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToastHandler } from '@/hooks/use-toast-handler';
import { getErrorMessage } from '@/lib/error';
import { LogOut, Mail, KeyRound, Loader2, HeartHandshake } from 'lucide-react';

export default function ProfilePage() {
  const { logout } = useAuth();
  const toast = useToastHandler();

  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sendingReset, setSendingReset] = useState(false);
  const [stats, setStats] = useState<{ total: number; donated: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await authService.me();
        setMe(res.data);
        setFullName(res.data.fullName);
        setPhone(res.data.phone ?? '');

        if (res.data.role === 'USER') {
          const [totalRes, donatedRes] = await Promise.all([
            donationService.listMine({ page: 1, size: 1 }),
            donationService.listMine({ page: 1, size: 1, donationStatus: 'DONATED' }),
          ]);
          setStats({ total: totalRes.data.total, donated: donatedRes.data.total });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (fullName.trim().length < 3) {
      setError('O nome deve ter pelo menos 3 caracteres.');
      return;
    }
    setSaving(true);
    try {
      const res = await userService.updateMe({ fullName: fullName.trim(), phone: phone.trim() || undefined });
      setMe(res.data);
      toast.success('Perfil actualizado com sucesso');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao actualizar perfil'));
    } finally {
      setSaving(false);
    }
  };

  const onRequestPasswordReset = async () => {
    if (!me) return;
    setSendingReset(true);
    try {
      await authService.forgotPassword(me.email);
      toast.success('Enviámos um link para mudares a palavra-passe para o teu email');
    } catch {
      toast.error('Erro ao enviar o email de recuperação');
    } finally {
      setSendingReset(false);
    }
  };

  if (loading || !me) return <Loading />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="O meu perfil" description="Gere os teus dados de conta" />

      {me.role === 'USER' && stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-background p-5 text-center">
            <HeartHandshake className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-2 text-2xl font-semibold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Doações feitas</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5 text-center">
            <HeartHandshake className="mx-auto h-6 w-6 text-green-600" />
            <p className="mt-2 text-2xl font-semibold text-foreground">{stats.donated}</p>
            <p className="text-xs text-muted-foreground">Doações concluídas</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Dados pessoais</p>
          <Badge variant={me.role === 'ADMIN' ? 'default' : 'secondary'}>
            {me.role === 'ADMIN' ? 'Admin' : 'Utilizador'}
          </Badge>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={onSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Nome completo</Label>
            <Input id="p-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-phone">Telefone</Label>
            <Input id="p-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9XX XXX XXX" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {me.email}
              {me.emailVerified ? (
                <Badge className="ml-auto bg-green-100 text-green-800">Verificado</Badge>
              ) : (
                <Badge className="ml-auto bg-yellow-100 text-yellow-800">Por verificar</Badge>
              )}
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Guardar alterações
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-background p-6">
        <p className="mb-1 text-sm font-medium text-foreground">Palavra-passe</p>
        <p className="mb-4 text-sm text-muted-foreground">
          Por segurança, a mudança de palavra-passe é feita por email — enviamos-te um link seguro.
        </p>
        <Button variant="outline" onClick={onRequestPasswordReset} disabled={sendingReset}>
          {sendingReset ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <KeyRound className="mr-1.5 h-4 w-4" />}
          Enviar link para mudar a palavra-passe
        </Button>
      </div>

      <Separator />

      <Button variant="destructive" onClick={logout}>
        <LogOut className="h-4 w-4" />
        Terminar sessão
      </Button>
    </div>
  );
}
