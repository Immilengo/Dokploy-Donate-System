import { Router } from 'express';
import { UserController } from '@modules/users/controller/user.controller';
import { authMiddleware } from '@middlewares/auth.middleware';
import { roleMiddleware } from '@middlewares/roles.middleware';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { asyncHandler } from '@utils/async-handler';
import { updateProfileSchema, updateUserByAdminSchema } from '../validator/user.validator';

const controller = new UserController();
export const userRoutes = Router();

userRoutes.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestão de utilizadores
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Obter perfil do utilizador autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtido
 *       401:
 *         description: Não autenticado
 */
userRoutes.get('/me', asyncHandler(controller.me.bind(controller)));

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Actualizar o próprio perfil
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
userRoutes.patch(
  '/me',
  validationMiddleware(updateProfileSchema),
  asyncHandler(controller.updateMe.bind(controller))
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Listar todos os utilizadores (admin)
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN]
 *       - in: query
 *         name: recordStatus
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, ALL]
 *     responses:
 *       200:
 *         description: Lista de utilizadores
 *       403:
 *         description: Forbidden
 */
userRoutes.get(
  '/',
  roleMiddleware(['ADMIN']),
  asyncHandler(controller.list.bind(controller))
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obter utilizador por ID (admin ou próprio user)
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
 *         description: Utilizador obtido
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Não encontrado
 */
userRoutes.get('/:id', asyncHandler(controller.getById.bind(controller)));

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Actualizar utilizador (admin)
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
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *               recordStatus:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Utilizador actualizado
 *       403:
 *         description: Forbidden
 */
userRoutes.patch(
  '/:id',
  roleMiddleware(['ADMIN']),
  validationMiddleware(updateUserByAdminSchema),
  asyncHandler(controller.updateByAdmin.bind(controller))
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar utilizador — soft delete (admin)
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
 *         description: Utilizador eliminado
 *       400:
 *         description: Não podes eliminar a tua própria conta
 *       403:
 *         description: Forbidden
 */
userRoutes.delete(
  '/:id',
  roleMiddleware(['ADMIN']),
  asyncHandler(controller.remove.bind(controller))
);