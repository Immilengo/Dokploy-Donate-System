import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  phone: z.string().optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'Pelo menos um campo deve ser enviado' });

export const updateUserByAdminSchema = z.object({
  fullName: z.string().min(3).optional(),
  phone: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  recordStatus: z.enum(['ACTIVE', 'INACTIVE']).optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'Pelo menos um campo deve ser enviado' });