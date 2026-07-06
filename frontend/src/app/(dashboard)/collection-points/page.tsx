'use client';

import { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { collectionPointService } from '@/services/collection-point.service';
import { CollectionPoint } from '@/types';
import { PageHeader } from '@/components/layout/page-header';
import { Loading } from '@/components/shared/loading';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToastHandler } from '@/hooks/use-toast-handler';
import { MapPin, Plus, Pencil, Trash2, Power, Loader2 } from 'lucide-react';

const RECORD_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-700',
  DELETED: 'bg-red-100 text-red-800',
};

const RECORD_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  DELETED: 'Eliminado',
};

const emptyForm = { name: '', address: '', city: '', description: '', schedule: '' };

function CollectionPointsPageInner() {
  const toast = useToastHandler();

  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [recordStatus, setRecordStatus] = useState<'ACTIVE' | 'INACTIVE' | 'ALL'>('ACTIVE');
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CollectionPoint | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await collectionPointService.list({
        page,
        size: 10,
        search: search.trim() || undefined,
        recordStatus,
      });
      setPoints(res.data.items);
      setTotalPages(res.data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, recordStatus, search]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (p: CollectionPoint) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      address: p.address,
      city: p.city,
      description: p.description ?? '',
      schedule: p.schedule ?? '',
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const onSave = async () => {
    setFormError(null);
    if (!form.name.trim() || !form.address.trim() || !form.city.trim()) {
      setFormError('Nome, morada e cidade são obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        description: form.description.trim() || undefined,
        schedule: form.schedule.trim() || undefined,
      };

      if (editingId) {
        await collectionPointService.update(editingId, payload);
        toast.success('Ponto de recolha actualizado');
      } else {
        await collectionPointService.create(payload);
        toast.success('Ponto de recolha criado');
      }

      setDialogOpen(false);
      await load();
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Erro ao guardar ponto de recolha');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: CollectionPoint) => {
    try {
      await collectionPointService.update(p.id, {
        recordStatus: p.recordStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
      toast.success(p.recordStatus === 'ACTIVE' ? 'Ponto desactivado' : 'Ponto activado');
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erro ao actualizar status');
    }
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await collectionPointService.remove(deleteTarget.id);
      toast.success('Ponto de recolha eliminado');
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erro ao eliminar');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Pontos de recolha"
        description="Gere os locais onde os utilizadores entregam as doações"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo ponto
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <Input
          placeholder="Pesquisar por nome ou cidade..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select value={recordStatus} onValueChange={(value) => { setRecordStatus(value as 'ACTIVE' | 'INACTIVE' | 'ALL'); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Activo</SelectItem>
            <SelectItem value="INACTIVE">Inactivo</SelectItem>
            <SelectItem value="ALL">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Loading />
      ) : points.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Nenhum ponto de recolha"
          description="Cria o primeiro ponto de recolha para os utilizadores poderem entregar doações."
          action={<Button onClick={openCreate}>Novo ponto</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Morada</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {points.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                  <TableCell>{p.city}</TableCell>
                  <TableCell className="max-w-xs truncate">{p.address}</TableCell>
                  <TableCell>{p.schedule || '—'}</TableCell>
                  <TableCell>
                    <Badge className={RECORD_STATUS_COLORS[p.recordStatus]}>
                      {RECORD_STATUS_LABELS[p.recordStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => toggleActive(p)} title="Activar/Desactivar">
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)} title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(p)}
                        title="Eliminar"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Dialog de criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar ponto de recolha' : 'Novo ponto de recolha'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Actualiza os dados do ponto de recolha.' : 'Preenche os dados do novo ponto.'}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cp-name">Nome</Label>
              <Input
                id="cp-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Centro Comunitário do Kilamba"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cp-city">Cidade</Label>
                <Input
                  id="cp-city"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Luanda"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-schedule">Horário</Label>
                <Input
                  id="cp-schedule"
                  value={form.schedule}
                  onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
                  placeholder="Seg-Sex 08h-17h"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-address">Morada</Label>
              <Input
                id="cp-address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Rua, número, referência"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-description">Descrição (opcional)</Label>
              <Textarea
                id="cp-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de eliminação */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar ponto de recolha"
        description={`Tens a certeza que queres eliminar "${deleteTarget?.name}"? Esta acção é reversível apenas por um admin (soft delete).`}
        confirmLabel="Eliminar"
        variant="destructive"
        loading={deleting}
        onConfirm={onDelete}
      />
    </div>
  );
}

export default function CollectionPointsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <CollectionPointsPageInner />
    </ProtectedRoute>
  );
}