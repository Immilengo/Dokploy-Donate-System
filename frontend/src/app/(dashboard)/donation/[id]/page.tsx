'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { donationService } from '@/services/donations.service';
import { Donation, DonationStatus } from '@/types';
import {
  DONATION_STATUS_LABELS,
  DONATION_STATUS_COLORS,
  DONATION_CATEGORY_LABELS,
  ALLOWED_TRANSITIONS,
} from '@/lib/constants';
import { PageHeader } from '@/components/layout/page-header';
import { Loading } from '@/components/shared/loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToastHandler } from '@/hooks/use-toast-handler';
import { Loader2, MapPin, HeartHandshake, Upload } from 'lucide-react';

const STATUS_ORDER: DonationStatus[] = ['PENDING', 'APPROVED', 'RECEIVED', 'IN_DELIVERY', 'DONATED'];

export default function DonationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToastHandler();
  const isAdmin = user?.role === 'ADMIN';

  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);

  const [nextStatus, setNextStatus] = useState<DonationStatus | ''>('');
  const [adminNote, setAdminNote] = useState('');
  const [messageMode, setMessageMode] = useState<'default' | 'custom'>('default');
  const [customMessage, setCustomMessage] = useState('');
  const [deliveryImageFile, setDeliveryImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await donationService.getById(id);
      setDonation(res.data);
      setAdminNote(res.data.adminNote ?? '');
    } catch {
      toast.error('Doação não encontrada');
      router.push('/donation');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !donation) return <Loading />;

  const deliveryImageUrl = donation.deliveryImageUrl
    ? donation.deliveryImageUrl.startsWith('http')
      ? donation.deliveryImageUrl
      : `${process.env.NEXT_PUBLIC_API_URL}${donation.deliveryImageUrl}`
    : '';

  const onUploadImage = async () => {
    if (!deliveryImageFile) return;
    setUploadingImage(true);
    try {
      await donationService.uploadDeliveryImage(donation.id, deliveryImageFile);
      toast.success('Imagem enviada com sucesso');
      setDeliveryImageFile(null);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erro ao enviar imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const allowedNext = ALLOWED_TRANSITIONS[donation.donationStatus] ?? [];
  const isRejectedOrCancelled = ['REJECTED', 'CANCELLED'].includes(donation.donationStatus);
  const isTerminal = allowedNext.length === 0;

  const onUpdateStatus = async () => {
    if (!nextStatus) return;
    setSubmitting(true);
    try {
      await donationService.updateStatus(donation.id, {
        donationStatus: nextStatus,
        adminNote: adminNote.trim() || undefined,
        ...(nextStatus === 'DONATED'
          ? {
              useDefaultMessage: messageMode === 'default',
              thankYouMessage: messageMode === 'custom' ? customMessage.trim() : undefined,
            }
          : {}),
      });
      toast.success('Status actualizado com sucesso');
      setNextStatus('');
      setCustomMessage('');
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erro ao actualizar status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Detalhe da doação"
        description={`Criada em ${new Date(donation.createdAt).toLocaleDateString('pt-PT')}`}
      />

      <div className="rounded-2xl border border-border bg-background p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Categoria</p>
            <p className="font-medium text-foreground">{DONATION_CATEGORY_LABELS[donation.category]}</p>
          </div>
          <Badge className={DONATION_STATUS_COLORS[donation.donationStatus]}>
            {DONATION_STATUS_LABELS[donation.donationStatus]}
          </Badge>
        </div>

        <Separator className="my-4" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Descrição</p>
            <p className="text-sm text-foreground">{donation.description}</p>
          </div>
          {donation.estimatedQuantity && (
            <div>
              <p className="text-sm text-muted-foreground">Quantidade estimada</p>
              <p className="text-sm text-foreground">{donation.estimatedQuantity}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Ponto de recolha</p>
            <p className="flex items-center gap-1 text-sm text-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {donation.collectionPoint.name} — {donation.collectionPoint.address}, {donation.collectionPoint.city}
            </p>
          </div>
          {isAdmin && (
            <div>
              <p className="text-sm text-muted-foreground">Doador</p>
              <p className="text-sm text-foreground">
                {donation.user.fullName} ({donation.user.email})
              </p>
            </div>
          )}
        </div>

        {donation.adminNote && (
          <div className="mt-4 rounded-lg bg-muted p-3">
            <p className="text-xs font-medium text-muted-foreground">Nota da fundação</p>
            <p className="text-sm text-foreground">{donation.adminNote}</p>
          </div>
        )}
      </div>

      {!isRejectedOrCancelled && (
        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="mb-4 text-sm font-medium text-foreground">Percurso da doação</p>
          <ol className="space-y-4">
            {STATUS_ORDER.map((s, i) => {
              const currentIndex = STATUS_ORDER.indexOf(donation.donationStatus);
              const reached = i <= currentIndex;
              return (
                <li key={s} className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      reached ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`text-sm ${reached ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {DONATION_STATUS_LABELS[s]}
                  </span>
                  {i < STATUS_ORDER.length - 1 && <span className="h-px flex-1 bg-border" aria-hidden />}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {donation.donationStatus === 'DONATED' && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
          <HeartHandshake className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-sm font-medium text-foreground">{donation.thankYouMessage}</p>
          {deliveryImageUrl && (
            <img
              src={deliveryImageUrl}
              alt="Entrega da doação"
              className="mx-auto mt-4 max-h-80 rounded-xl border border-border object-cover"
            />
          )}
        </div>
      )}

      {isAdmin && !isTerminal && (
        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="mb-4 text-sm font-medium text-foreground">Actualizar status</p>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Novo status</Label>
              <Select value={nextStatus} onValueChange={(v) => setNextStatus(v as DonationStatus)}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Escolhe o próximo status" />
                </SelectTrigger>
                <SelectContent>
                  {allowedNext.map((s) => (
                    <SelectItem key={s} value={s}>
                      {DONATION_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adminNote">
                Nota {nextStatus === 'REJECTED' ? '(explica porque o ponto está indisponível)' : '(opcional)'}
              </Label>
              <Textarea id="adminNote" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={3} />
            </div>

            {nextStatus === 'DONATED' && (
              <div className="space-y-4 rounded-xl bg-muted p-4">
                <div className="space-y-1.5">
                  <Label>Mensagem de agradecimento</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input type="radio" checked={messageMode === 'default'} onChange={() => setMessageMode('default')} />
                      Usar mensagem padrão
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input type="radio" checked={messageMode === 'custom'} onChange={() => setMessageMode('custom')} />
                      Escrever mensagem personalizada
                    </label>
                  </div>
                  {messageMode === 'custom' && (
                    <Textarea
                      placeholder={`Olá ${donation.user.fullName}, ...`}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={3}
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="deliveryImageFile">Imagem da entrega (opcional)</Label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Input
                      id="deliveryImageFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDeliveryImageFile(e.target.files?.[0] ?? null)}
                      className="sm:max-w-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onUploadImage}
                      disabled={!deliveryImageFile || uploadingImage}
                    >
                      {uploadingImage && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                      <Upload className="mr-1.5 h-4 w-4" />
                      Enviar imagem
                    </Button>
                  </div>
                  {deliveryImageFile && (
                    <p className="text-xs text-muted-foreground">Ficheiro selecionado: {deliveryImageFile.name}</p>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={onUpdateStatus}
              disabled={
                !nextStatus ||
                submitting ||
                (nextStatus === 'DONATED' && messageMode === 'custom' && !customMessage.trim())
              }
            >
              {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Confirmar actualização
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
