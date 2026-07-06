import { prisma } from '@infra/database/prisma';
import { Prisma, RecordStatus } from '@prisma/client';

export class CollectionPointRepository {
  async create(data: Prisma.CollectionPointCreateInput) {
    return prisma.collectionPoint.create({ data });
  }

  async findById(id: string) {
    return prisma.collectionPoint.findUnique({ where: { id, deleted: false } });
  }

  async findMany(params: {
    skip: number;
    take: number;
    recordStatus?: 'ACTIVE' | 'INACTIVE' | 'ALL';
    search?: string;
    city?: string;
  }) {
    const where: Prisma.CollectionPointWhereInput = {
      deleted: false,
      ...(params.recordStatus && params.recordStatus !== 'ALL'
        ? { recordStatus: params.recordStatus }
        : {}),
      ...(params.city ? { city: { contains: params.city, mode: 'insensitive' } } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { address: { contains: params.search, mode: 'insensitive' } },
              { city: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.collectionPoint.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.collectionPoint.count({ where }),
    ]);

    return { items, total };
  }

  async update(id: string, data: Prisma.CollectionPointUpdateInput) {
    return prisma.collectionPoint.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.collectionPoint.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date(),
        recordStatus: 'DELETED' as RecordStatus,
      },
    });
  }
}
