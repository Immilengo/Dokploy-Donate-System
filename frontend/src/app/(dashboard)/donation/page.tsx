'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { donationService } from '@/services/donations.service';
import { Donation, DonationStatus } from '@/types';
import { DONATION_STATUS_LABELS, DONATION_STATUS_COLORS, DONATION_CATEGORY_LABELS } from '@/lib/constants';
import { PageHeader } from '@/components/layout/page-header';
import { Loading } from '@/components/shared/loading';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeartHandshake, Plus } from 'lucide-react';

const STATUS_OPTIONS: (DonationStatus | 'ALL')[] = [
  'ALL', 'PENDING', 'APPROVED', 'REJECTED', 'RECEIVED', 'IN_DELIVERY', 'DONATED', 'CANCELLED',
];

export default function DonationListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [donations, setDonations] = useState<Donation[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<DonationStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 10,
        ...(status !== 'ALL' ? { donationStatus: status } : {}),
      };
      const res = isAdmin
        ? await donationService.listAll(params)
        : await donationService.listMine(params);
      setDonations(res.data.items);
      setTotalPages(res.data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, page, status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title={isAdmin ? 'Doações' : 'As minhas doações'}
        description={isAdmin ? 'Gere todas as doações da plataforma' : 'Acompanha o estado das tuas doações'}
        action={
          !isAdmin && (
            <Button render={<Link href="/donation/new" />}>
              <Plus className="h-4 w-4" />
              Nova doação
            </Button>
          )
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as DonationStatus | 'ALL');
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'ALL' ? 'Todos os status' : DONATION_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Loading />
      ) : donations.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="Ainda não há doações"
          description={
            isAdmin
              ? 'Quando os utilizadores criarem doações, aparecem aqui.'
              : 'Cria a tua primeira doação e ajuda quem precisa.'
          }
          action={!isAdmin && <Button render={<Link href="/donation/new" />}>Nova doação</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead>Doador</TableHead>}
                <TableHead>Categoria</TableHead>
                <TableHead>Ponto de recolha</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((d) => (
                <TableRow
                  key={d.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/donation/${d.id}`)}
                >
                  {isAdmin && <TableCell>{d.user.fullName}</TableCell>}
                  <TableCell>{DONATION_CATEGORY_LABELS[d.category]}</TableCell>
                  <TableCell>{d.collectionPoint.name}</TableCell>
                  <TableCell>
                    <Badge className={DONATION_STATUS_COLORS[d.donationStatus]}>
                      {DONATION_STATUS_LABELS[d.donationStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(d.createdAt).toLocaleDateString('pt-PT')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}