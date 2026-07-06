'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { donationService } from '@/services/donations.service';
import { collectionPointService } from '@/services/collection-point.service';
import { CollectionPoint, DonationCategory } from '@/types';
import { DONATION_CATEGORY_LABELS } from '@/lib/constants';
import { PageHeader } from '@/components/layout/page-header';
import { Loading } from '@/components/shared/loading';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToastHandler } from '@/hooks/use-toast-handler';
import { Loader2 } from 'lucide-react';

const CATEGORY_OPTIONS: DonationCategory[] = ['CLOTHING', 'FOOTWEAR', 'BLANKETS', 'TOYS', 'BOOKS', 'OTHER'];

export default function NewDonationPage() {
  const router = useRouter();
  const toast = useToastHandler();

  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [loadingPoints, setLoadingPoints] = useState(true);

  const [collectionPointId, setCollectionPointId] = useState('');
  const [category, setCategory] = useState<DonationCategory | ''>('');
  const [description, setDescription] = useState('');
  const [estimatedQuantity, setEstimatedQuantity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await collectionPointService.list({ size: 100, recordStatus: 'ACTIVE' });
        setPoints(res.data.items);
      } catch {
        toast.error('Não foi possível carregar os pontos de recolha');
      } finally {
        setLoadingPoints(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!collectionPointId) return setError('Escolhe um ponto de recolha.');
    if (!category) return setError('Escolhe uma categoria.');
    if (description.trim().length < 10) return setError('A descrição deve ter pelo menos 10 caracteres.');

    setSubmitting(true);
    try {
      const res = await donationService.create({
        collectionPointId,
        category,
        description: description.trim(),
        estimatedQuantity: estimatedQuantity.trim() || undefined,
      });
      toast.success('Doação criada! Aguarda a aprovação da fundação.');
      router.push(`/donation/${res.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao criar doação');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Nova doação" description="Descreve o que vais doar e escolhe onde entregar" />

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-background p-6">
        <div className="space-y-1.5">
          <Label>Ponto de recolha</Label>
          {loadingPoints ? (
            <Loading label="A carregar pontos de recolha..." />
          ) : points.length === 0 ? (
            <p className="text-sm text-muted-foreground">Não há pontos de recolha disponíveis no momento.</p>
          ) : (
            <Select value={collectionPointId} onValueChange={(v) => setCollectionPointId(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolhe um ponto de recolha" />
              </SelectTrigger>
              <SelectContent>
                {points.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Categoria</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as DonationCategory)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolhe uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {DONATION_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            placeholder="Ex: 3 sacos de roupa de inverno, tamanhos variados, em bom estado"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">Mínimo 10 caracteres.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="estimatedQuantity">Quantidade estimada (opcional)</Label>
          <Input
            id="estimatedQuantity"
            placeholder="Ex: 2 sacos, 1 caixa"
            value={estimatedQuantity}
            onChange={(e) => setEstimatedQuantity(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          Criar doação
        </Button>
      </form>
    </div>
  );
}
