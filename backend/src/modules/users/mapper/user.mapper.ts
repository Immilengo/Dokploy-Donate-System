import { User } from '@prisma/client';

export const toUserOutput = (user: User) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  recordStatus: user.recordStatus,
  emailVerified: user.emailVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const toUsersPage = (
  items: User[],
  total: number,
  page: number,
  size: number
) => ({
  items: items.map(toUserOutput),
  total,
  page,
  size,
  totalPages: Math.ceil(total / size),
});