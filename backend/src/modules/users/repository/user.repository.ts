import { prisma } from '@infra/database/prisma';
import { Prisma, RecordStatus } from '@prisma/client';

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id, deleted: false } });
  }

  async findMany(params: {
    skip: number;
    take: number;
    recordStatus?: 'ACTIVE' | 'INACTIVE' | 'ALL';
    search?: string;
    role?: 'USER' | 'ADMIN';
  }) {
    const where: Prisma.UserWhereInput = {
      deleted: false,
      ...(params.recordStatus && params.recordStatus !== 'ALL'
        ? { recordStatus: params.recordStatus }
        : {}),
      ...(params.role ? { role: params.role } : {}),
      ...(params.search
        ? {
            OR: [
              { fullName: { contains: params.search, mode: 'insensitive' } },
              { email: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date(),
        recordStatus: 'DELETED' as RecordStatus,
      },
    });
  }
}
