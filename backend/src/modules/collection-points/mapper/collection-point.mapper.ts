import { CollectionPoint } from '@prisma/client';

export const toCollectionPointOutput = (cp: CollectionPoint) => ({
  id: cp.id,
  name: cp.name,
  address: cp.address,
  city: cp.city,
  description: cp.description,
  schedule: cp.schedule,
  recordStatus: cp.recordStatus,
  createdAt: cp.createdAt,
  updatedAt: cp.updatedAt,
});

export const toCollectionPointsPage = (
  items: CollectionPoint[],
  total: number,
  page: number,
  size: number
) => ({
  items: items.map(toCollectionPointOutput),
  total,
  page,
  size,
  totalPages: Math.ceil(total / size),
});