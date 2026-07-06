'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { userService } from '@/services/user.service';
import { User, Role, RecordStatus } from '@/types';
import { PageHeader } from '@/components/layout/page-header';
import { Loading } from '@/components/shared/loading';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getErrorMessage } from '@/lib/error';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToastHandler } from '@/hooks/use-toast-handler';
import { Users as UsersIcon, Pencil, Trash2, Power, Loader2, ShieldCheck } from 'lucide-react';

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
const ROLE_LABELS: Record<Role, string> = { USER: 'Utilizador', ADMIN: 'Admin' };

function UsersPageInner() {
  const { user: currentUser } = useAuth();
  const toast = useToastHandler();

  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    role: 'USER' as Role,
    recordStatus: 'ACTIVE' as RecordStatus,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.list({
        page,
        size: 10,
        search: search.trim() || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
      });
      setUsers(res.data.items);
      setTotalPages(res.data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({
      fullName: u.fullName,
      phone: u.phone ?? '',
      role: u.role,
      recordStatus: u.recordStatus === 'DELETED' ? 'ACTIVE' : u.recordStatus,
    });
    setFormError(null);
  };

  const onSave = async () => {
    if (!editing) return;
    setFormError(null);
    if (form.fullName.trim().length < 3) {
      setFormError('O nome deve ter pelo menos 3 caracteres.');
      return;
    }

    setSaving(true);
    try {
      await userService.updateByAdmin(editing.id, {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
        role: form.role,
        recordStatus: form.recordStatus,
      });
      toast.success('Utilizador actualizado');
      setEditing(null);
      await load();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, 'Erro ao actualizar utilizador'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: User) => {
    try {
      await userService.updateByAdmin(u.id, {
        recordStatus: u.recordStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
      toast.success(u.recordStatus === 'ACTIVE' ? 'Utilizador desactivado' : 'Utilizador activado');
      await load();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao actualizar status'));
    }
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await userService.remove(deleteTarget.id);
      toast.success('Utilizador eliminado');
      setDeleteTarget(null);
      await load();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao eliminar utilizador'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Utilizadores" description="Gere utilizadores e promove novos administradores" />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          className="max-w-xs"
          placeholder="Pesquisar por nome ou email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v as Role | 'ALL');
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os roles</SelectItem>
            <SelectItem value="USER">Utilizador</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Loading />
      ) : users.length === 0 ? (
        <EmptyState icon={UsersIcon} title="Nenhum utilizador encontrado" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-foreground">
                      {u.fullName} {isSelf && <span className="text-xs text-muted-foreground">(tu)</span>}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {u.role === 'ADMIN' && <ShieldCheck className="h-3 w-3" />}
                        {ROLE_LABELS[u.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={RECORD_STATUS_COLORS[u.recordStatus]}>
                        {RECORD_STATUS_LABELS[u.recordStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => toggleActive(u)}
                          disabled={isSelf}
                          title="Activar/Desactivar"
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(u)} title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTarget(u)}
                          disabled={isSelf}
                          title="Eliminar"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar utilizador</DialogTitle>
            <DialogDescription>{editing?.email}</DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="u-name">Nome completo</Label>
              <Input
                id="u-name"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-phone">Telefone</Label>
              <Input
                id="u-phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm((f) => ({ ...f, role: v as Role }))}
                  disabled={editing?.id === currentUser?.id}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Utilizador</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.recordStatus}
                  onValueChange={(v) => setForm((f) => ({ ...f, recordStatus: v as RecordStatus }))}
                  disabled={editing?.id === currentUser?.id}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar utilizador"
        description={`Tens a certeza que queres eliminar "${deleteTarget?.fullName}"? A conta fica marcada como eliminada (soft delete).`}
        confirmLabel="Eliminar"
        variant="destructive"
        loading={deleting}
        onConfirm={onDelete}
      />
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <UsersPageInner />
    </ProtectedRoute>
  );
}
