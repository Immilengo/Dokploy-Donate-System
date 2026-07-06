import { z } from 'zod';

export const createCollectionPointSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  city: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  schedule: z.string().optional(),
});

export const updateCollectionPointSchema = z.object({
  name: z.string().min(3).optional(),
  address: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  description: z.string().optional(),
  schedule: z.string().optional(),
  recordStatus: z.enum(['ACTIVE', 'INACTIVE']).optional(),
}).refine(obj => Object.keys(obj).length > 0, {
  message: 'Pelo menos um campo deve ser enviado',
});