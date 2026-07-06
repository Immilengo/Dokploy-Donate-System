'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { dashboardService } from '@/services/dashboard.service';
import { DashboardSummary } from '@/types';
import { DONATION_STATUS_LABELS, DONATION_STATUS_COLORS, DONATION_CATEGORY_LABELS } from '@/lib/constants';
import { PageHeader } from '@/components/layout/page-header';
import { Loading } from '@/components/shared/loading';
import { Badge } from '@/components/ui/badge';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Package, Clock, Truck, HeartHandshake, Users, MapPin, LucideIcon } from 'lucide-react';

const STATUS_CHART_COLORS: Record<string, string> = {
  PENDING: '#eab308',
  APPROVED: '#3b82f6',
  REJECTED: '#ef4444',
  RECEIVED: '#a855f7',
  IN_DELIVERY: '#f97316',
  DONATED: '#22c55e',
  CANCELLED: '#9ca3af',
};

const GRID_COLOR = '#e5e7eb';
const PRIMARY_COLOR = '#171717';

type StatusTooltipItem = {
  payload?: {
    status: keyof typeof STATUS_CHART_COLORS;
  };
};

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function formatMonth(key: string) {
  const [year, month] = key.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
}

function DashboardPageInner() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardService.getSummary();
        setSummary(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !summary) return <Loading />;

  const { counters, charts, topCollectionPoints, topDonors, recentDonations } = summary;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Visão geral da Fundação Hubble" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Package} label="Total doações" value={counters.donations.total} />
        <StatCard icon={Clock} label="Pendentes" value={counters.donations.pending} />
        <StatCard icon={Truck} label="Em entrega" value={counters.donations.inDelivery} />
        <StatCard icon={HeartHandshake} label="Doadas" value={counters.donations.donated} />
        <StatCard icon={Users} label="Utilizadores" value={counters.users.total} />
        <StatCard icon={MapPin} label="Pontos activos" value={counters.collectionPoints.active} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="mb-4 text-sm font-medium text-foreground">Doações por status</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.donationsByStatus}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {charts.donationsByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, item: StatusTooltipItem) => [
                    Number(value ?? 0),
                    DONATION_STATUS_LABELS[item.payload?.status ?? 'PENDING'],
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {charts.donationsByStatus.map((s) => (
              <Badge key={s.status} className={DONATION_STATUS_COLORS[s.status]}>
                {DONATION_STATUS_LABELS[s.status]}: {s.count}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="mb-4 text-sm font-medium text-foreground">Doações por mês (últimos 12 meses)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.donationsByMonth.map((m) => ({ ...m, label: formatMonth(m.month) }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="donated" name="Doadas" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="mb-4 text-sm font-medium text-foreground">Doações por categoria</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={charts.donationsByCategory.map((c) => ({
                  ...c,
                  label: DONATION_CATEGORY_LABELS[c.category] ?? c.category,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={GRID_COLOR} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="label" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill={PRIMARY_COLOR} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="mb-4 text-sm font-medium text-foreground">Pontos de recolha mais activos</p>
          {topCollectionPoints.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ainda sem dados suficientes.</p>
          ) : (
            <ul className="space-y-3">
              {topCollectionPoints.map((p, i) => (
                <li key={p.collectionPointId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.city}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{p.count} doações</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="mb-4 text-sm font-medium text-foreground">Top doadores</p>
          {topDonors.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ainda sem doações concluídas.</p>
          ) : (
            <ul className="space-y-3">
              {topDonors.map((d, i) => (
                <li key={d.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.fullName}</p>
                      <p className="text-xs text-muted-foreground">{d.email}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{d.donationsCompleted} doadas</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="mb-4 text-sm font-medium text-foreground">Doações recentes</p>
          {recentDonations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ainda não há doações.</p>
          ) : (
            <ul className="space-y-3">
              {recentDonations.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{d.user?.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {d.category ? DONATION_CATEGORY_LABELS[d.category] : ''} · {d.collectionPoint?.name}
                    </p>
                  </div>
                  {d.donationStatus && (
                    <Badge className={DONATION_STATUS_COLORS[d.donationStatus]}>
                      {DONATION_STATUS_LABELS[d.donationStatus]}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardPageInner />
    </ProtectedRoute>
  );
}
