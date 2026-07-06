import { prisma } from '@infra/database/prisma';

export class DashboardRepository {
  async getCounters() {
    const [
      totalDonations,
      pending,
      approved,
      rejected,
      received,
      inDelivery,
      donated,
      cancelled,
      totalUsers,
      totalCollectionPoints,
      activeCollectionPoints,
    ] = await Promise.all([
      prisma.donation.count({ where: { deleted: false } }),
      prisma.donation.count({ where: { deleted: false, donationStatus: 'PENDING' } }),
      prisma.donation.count({ where: { deleted: false, donationStatus: 'APPROVED' } }),
      prisma.donation.count({ where: { deleted: false, donationStatus: 'REJECTED' } }),
      prisma.donation.count({ where: { deleted: false, donationStatus: 'RECEIVED' } }),
      prisma.donation.count({ where: { deleted: false, donationStatus: 'IN_DELIVERY' } }),
      prisma.donation.count({ where: { deleted: false, donationStatus: 'DONATED' } }),
      prisma.donation.count({ where: { deleted: false, donationStatus: 'CANCELLED' } }),
      prisma.user.count({ where: { deleted: false, role: 'USER' } }),
      prisma.collectionPoint.count({ where: { deleted: false } }),
      prisma.collectionPoint.count({ where: { deleted: false, recordStatus: 'ACTIVE' } }),
    ]);

    return {
      donations: {
        total: totalDonations,
        pending,
        approved,
        rejected,
        received,
        inDelivery,
        donated,
        cancelled,
      },
      users: { total: totalUsers },
      collectionPoints: { total: totalCollectionPoints, active: activeCollectionPoints },
    };
  }

  async getDonationsByStatus() {
    const results = await prisma.donation.groupBy({
      by: ['donationStatus'],
      where: { deleted: false },
      _count: { id: true },
    });

    return results.map((r) => ({
      status: r.donationStatus,
      count: r._count.id,
    }));
  }

  async getDonationsByCategory() {
    const results = await prisma.donation.groupBy({
      by: ['category'],
      where: { deleted: false },
      _count: { id: true },
    });

    return results.map((r) => ({
      category: r.category,
      count: r._count.id,
    }));
  }

  async getDonationsByMonth() {
    // últimos 12 meses
    const since = new Date();
    since.setMonth(since.getMonth() - 11);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const donations = await prisma.donation.findMany({
      where: { deleted: false, createdAt: { gte: since } },
      select: { createdAt: true, donationStatus: true },
    });

    // agrupa por ano-mês
    const map: Record<string, { total: number; donated: number }> = {};

    for (const d of donations) {
      const key = `${d.createdAt.getFullYear()}-${String(d.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = { total: 0, donated: 0 };
      map[key].total += 1;
      if (d.donationStatus === 'DONATED') map[key].donated += 1;
    }

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));
  }

  async getTopCollectionPoints(limit = 5) {
    const results = await prisma.donation.groupBy({
      by: ['collectionPointId'],
      where: { deleted: false },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const ids = results.map((r) => r.collectionPointId);
    const points = await prisma.collectionPoint.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, city: true },
    });

    return results.map((r) => {
      const point = points.find((p) => p.id === r.collectionPointId);
      return {
        collectionPointId: r.collectionPointId,
        name: point?.name ?? 'Desconhecido',
        city: point?.city ?? '',
        count: r._count.id,
      };
    });
  }

  async getTopDonors(limit = 5) {
    const results = await prisma.donation.groupBy({
      by: ['userId'],
      where: { deleted: false, donationStatus: 'DONATED' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const ids = results.map((r) => r.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, fullName: true, email: true },
    });

    return results.map((r) => {
      const user = users.find((u) => u.id === r.userId);
      return {
        userId: r.userId,
        fullName: user?.fullName ?? 'Desconhecido',
        email: user?.email ?? '',
        donationsCompleted: r._count.id,
      };
    });
  }

  async getRecentDonations(limit = 10) {
    return prisma.donation.findMany({
      where: { deleted: false },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, fullName: true } },
        collectionPoint: { select: { id: true, name: true, city: true } },
      },
    });
  }
}