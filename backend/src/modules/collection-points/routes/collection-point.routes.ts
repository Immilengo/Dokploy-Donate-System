import { Router } from 'express';
import { CollectionPointController } from '@modules/collection-points/controller/controller-point.controller';
import { authMiddleware } from '@middlewares/auth.middleware';
import { roleMiddleware } from '@middlewares/roles.middleware';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { asyncHandler } from '@utils/async-handler';
import {
  createCollectionPointSchema,
  updateCollectionPointSchema,
} from '@modules/collection-points/validator/colletion-point.validator';

const controller = new CollectionPointController();
export const collectionPointRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: CollectionPoints
 *   description: Pontos de recolha da Fundação Hubble
 */

/**
 * @swagger
 * /api/collection-points:
 *   get:
 *     tags: [CollectionPoints]
 *     summary: Listar pontos de recolha
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: recordStatus
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, ALL]
 *     responses:
 *       200:
 *         description: Lista de pontos de recolha
 */
collectionPointRoutes.get(
  '/',
  authMiddleware,
  asyncHandler(controller.list.bind(controller))
);

/**
 * @swagger
 * /api/collection-points/{id}:
 *   get:
 *     tags: [CollectionPoints]
 *     summary: Obter ponto de recolha por ID
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
 *         description: Ponto de recolha obtido
 *       404:
 *         description: Não encontrado
 */
collectionPointRoutes.get(
  '/:id',
  authMiddleware,
  asyncHandler(controller.getById.bind(controller))
);

/**
 * @swagger
 * /api/collection-points:
 *   post:
 *     tags: [CollectionPoints]
 *     summary: Criar ponto de recolha (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address, city]
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               description:
 *                 type: string
 *               schedule:
 *                 type: string
 *                 example: "Seg-Sex 08h-17h"
 *     responses:
 *       201:
 *         description: Ponto de recolha criado
 *       403:
 *         description: Forbidden
 */
collectionPointRoutes.post(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validationMiddleware(createCollectionPointSchema),
  asyncHandler(controller.create.bind(controller))
);

/**
 * @swagger
 * /api/collection-points/{id}:
 *   patch:
 *     tags: [CollectionPoints]
 *     summary: Actualizar ponto de recolha (admin)
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
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               description:
 *                 type: string
 *               schedule:
 *                 type: string
 *               recordStatus:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Ponto de recolha actualizado
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Não encontrado
 */
collectionPointRoutes.patch(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validationMiddleware(updateCollectionPointSchema),
  asyncHandler(controller.update.bind(controller))
);

/**
 * @swagger
 * /api/collection-points/{id}:
 *   delete:
 *     tags: [CollectionPoints]
 *     summary: Eliminar ponto de recolha — soft delete (admin)
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
 *         description: Ponto de recolha eliminado
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Não encontrado
 */
collectionPointRoutes.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  asyncHandler(controller.remove.bind(controller))
);