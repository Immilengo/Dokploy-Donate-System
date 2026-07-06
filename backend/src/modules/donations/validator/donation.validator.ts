import { z } from 'zod';

export const createDonationSchema = z.object({
  collectionPointId: z.string().uuid('ID do ponto de recolha inválido'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  category: z.enum(['CLOTHING', 'FOOTWEAR', 'BLANKETS', 'TOYS', 'BOOKS', 'OTHER'], {
    errorMap: () => ({ message: 'Categoria inválida' }),
  }),
  estimatedQuantity: z.string().optional(),
});

export const updateDonationStatusSchema = z.object({
  donationStatus: z.enum(
    ['APPROVED', 'REJECTED', 'RECEIVED', 'IN_DELIVERY', 'DONATED', 'CANCELLED'],
    { errorMap: () => ({ message: 'Status inválido' }) }
  ),
  adminNote: z.string().optional(),
  thankYouMessage: z.string().optional(),
  deliveryImageUrl: z.string().url('URL inválida').optional(),
  useDefaultMessage: z.boolean().optional(),
});

export const updateDonationSchema = z.object({
  adminNote: z.string().optional(),
  thankYouMessage: z.string().optional(),
  deliveryImageUrl: z.string().url('URL inválida').optional(),
}).refine(obj => Object.keys(obj).length > 0, {
  message: 'Pelo menos um campo deve ser enviado',
});