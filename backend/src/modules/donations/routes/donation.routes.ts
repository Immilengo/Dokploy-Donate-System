import { Router } from 'express';
import { DonationController } from '../controller/donation.controller';
import { authMiddleware } from '@middlewares/auth.middleware';
import { roleMiddleware } from '@middlewares/roles.middleware';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { asyncHandler } from '@utils/async-handler';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  createDonationSchema,
  updateDonationStatusSchema,
  updateDonationSchema,
} from '../validator/donation.validator';

const controller = new DonationController();
export const donationRoutes = Router();
const deliveryUploadDir = path.join(process.cwd(), 'uploads', 'donations');
fs.mkdirSync(deliveryUploadDir, { recursive: true });
const deliveryImageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, deliveryUploadDir),
    filename: (_req, file, cb) => {
      const safeExt = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${safeExt}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Apenas imagens são permitidas'));
    }
    cb(null, true);
  },
  limits: { fileSize: 8 * 1024 * 1024 },
});

donationRoutes.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Donations
 *   description: Gestão de doações da Fundação Hubble
 */

/**
 * @swagger
 * /api/donations/my:
 *   get:
 *     tags: [Donations]
 *     summary: Histórico de doações do utilizador autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *       - in: query
 *         name: donationStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, RECEIVED, IN_DELIVERY, DONATED, CANCELLED]
 *     responses:
 *       200:
 *         description: Histórico obtido
 */
donationRoutes.get('/my', asyncHandler(controller.listMine.bind(controller)));

/**
 * @swagger
 * /api/donations:
 *   get:
 *     tags: [Donations]
 *     summary: Listar todas as doações (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *       - in: query
 *         name: donationStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, RECEIVED, IN_DELIVERY, DONATED, CANCELLED]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [CLOTHING, FOOTWEAR, BLANKETS, TOYS, BOOKS, OTHER]
 *       - in: query
 *         name: collectionPointId
 *         schema:
 *           type: string
 *       - in: query
 *         name: recordStatus
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, ALL]
 *     responses:
 *       200:
 *         description: Lista de doações
 *       403:
 *         description: Forbidden
 */
donationRoutes.get(
  '/',
  roleMiddleware(['ADMIN']),
  asyncHandler(controller.listAll.bind(controller))
);

/**
 * @swagger
 * /api/donations:
 *   post:
 *     tags: [Donations]
 *     summary: Criar nova doação
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [collectionPointId, description, category]
 *             properties:
 *               collectionPointId:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [CLOTHING, FOOTWEAR, BLANKETS, TOYS, BOOKS, OTHER]
 *               estimatedQuantity:
 *                 type: string
 *                 example: "2 sacos grandes"
 *     responses:
 *       201:
 *         description: Doação criada
 *       400:
 *         description: Ponto de recolha inactivo
 *       404:
 *         description: Ponto de recolha não encontrado
 */
donationRoutes.post(
  '/',
  validationMiddleware(createDonationSchema),
  asyncHandler(controller.create.bind(controller))
);

/**
 * @swagger
 * /api/donations/{id}:
 *   get:
 *     tags: [Donations]
 *     summary: Obter doação por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doação obtida
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Não encontrada
 */
donationRoutes.get('/:id', asyncHandler(controller.getById.bind(controller)));

/**
 * @swagger
 * /api/donations/{id}/status:
 *   patch:
 *     tags: [Donations]
 *     summary: Actualizar status da doação (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [donationStatus]
 *             properties:
 *               donationStatus:
 *                 type: string
 *                 enum: [APPROVED, REJECTED, RECEIVED, IN_DELIVERY, DONATED, CANCELLED]
 *               adminNote:
 *                 type: string
 *               useDefaultMessage:
 *                 type: boolean
 *                 description: "Se true envia mensagem padrão de agradecimento"
 *               thankYouMessage:
 *                 type: string
 *                 description: "Mensagem personalizada (só para status DONATED)"
 *               deliveryImageUrl:
 *                 type: string
 *                 description: "URL da imagem da entrega (só para status DONATED)"
 *     responses:
 *       200:
 *         description: Status actualizado
 *       400:
 *         description: Transição de status inválida
 *       403:
 *         description: Forbidden
 */
donationRoutes.patch(
  '/:id/status',
  roleMiddleware(['ADMIN']),
  validationMiddleware(updateDonationStatusSchema),
  asyncHandler(controller.updateStatus.bind(controller))
);

/**
 * @swagger
 * /api/donations/{id}/delivery-image:
 *   post:
 *     tags: [Donations]
 *     summary: Upload da imagem da entrega (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagem enviada
 *       400:
 *         description: Ficheiro inválido
 *       403:
 *         description: Forbidden
 */
donationRoutes.post(
  '/:id/delivery-image',
  roleMiddleware(['ADMIN']),
  deliveryImageUpload.single('image'),
  asyncHandler(controller.uploadDeliveryImage.bind(controller))
);

/**
 * @swagger
 * /api/donations/{id}:
 *   patch:
 *     tags: [Donations]
 *     summary: Actualizar nota ou imagem da doação (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminNote:
 *                 type: string
 *               thankYouMessage:
 *                 type: string
 *               deliveryImageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Doação actualizada
 *       403:
 *         description: Forbidden
 */
donationRoutes.patch(
  '/:id',
  roleMiddleware(['ADMIN']),
  validationMiddleware(updateDonationSchema),
  asyncHandler(controller.update.bind(controller))
);

/**
 * @swagger
 * /api/donations/{id}:
 *   delete:
 *     tags: [Donations]
 *     summary: Eliminar doação — soft delete (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doação eliminada
 *       400:
 *         description: Não é possível eliminar neste status
 *       403:
 *         description: Forbidden
 */
donationRoutes.delete(
  '/:id',
  roleMiddleware(['ADMIN']),
  asyncHandler(controller.remove.bind(controller))
);
