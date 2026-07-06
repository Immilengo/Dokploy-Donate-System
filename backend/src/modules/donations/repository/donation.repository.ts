import { prisma } from '@infra/database/prisma';
import { Prisma, DonationStatus } from '@prisma/client';

export class DonationRepository {
  private readonly include = {
    user: { select: { id: true, fullName: true, email: true } },
    collectionPoint: { select: { id: true, name: true, address: true, city: true } },
  } as const;

  async create(data: Prisma.DonationCreateInput) {
    return prisma.donation.create({ data, include: this.include });
  }

  async findById(id: string) {
    return prisma.donation.findUnique({ where: { id, deleted: false }, include: this.include });
  }

  async findMany(params: {
    skip: number;
    take: number;
    userId?: string;
    collectionPointId?: string;
    donationStatus?: DonationStatus;
    category?: string;
    recordStatus?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  }) {
    const where: Prisma.DonationWhereInput = {
      deleted: false,
      ...(params.userId ? { userId: params.userId } : {}),
      ...(params.collectionPointId ? { collectionPointId: params.collectionPointId } : {}),
      ...(params.donationStatus ? { donationStatus: params.donationStatus } : {}),
      ...(params.category ? { category: params.category as any } : {}),
      ...(params.recordStatus && params.recordStatus !== 'ALL'
        ? { recordStatus: params.recordStatus }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: this.include,
      }),
      prisma.donation.count({ where }),
    ]);

    return { items, total };
  }

  async update(id: string, data: Prisma.DonationUpdateInput) {
    return prisma.donation.update({ where: { id }, data, include: this.include });
  }

  async softDelete(id: string) {
    return prisma.donation.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date(),
        recordStatus: 'DELETED' as any,
      },
    });
  }
}