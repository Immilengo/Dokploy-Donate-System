import { Router } from 'express';
import { AuthController } from '../controller/auth.controller';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { authMiddleware } from '@middlewares/auth.middleware';
import { asyncHandler } from '@utils/async-handler';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  resendVerificationSchema,
} from '../validator/auth.validator';

const controller = new AuthController();
export const authRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação e gestão de conta
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registar novo utilizador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conta criada, email de verificação enviado
 *       409:
 *         description: Email já registado
 */
authRoutes.post('/register', validationMiddleware(registerSchema), asyncHandler(controller.register.bind(controller)));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login com email e password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login efectuado
 *       401:
 *         description: Credenciais inválidas
 *       403:
 *         description: Email não verificado ou conta inactiva
 */
authRoutes.post('/login', validationMiddleware(loginSchema), asyncHandler(controller.login.bind(controller)));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Dados do utilizador autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Não autenticado
 */
authRoutes.get('/me', authMiddleware, asyncHandler(controller.me.bind(controller)));

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Verificar email via token
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verificado
 *       400:
 *         description: Token inválido ou expirado
 */
authRoutes.get('/verify-email', asyncHandler(controller.verifyEmail.bind(controller)));

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Reenviar email de verificação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email reenviado se existir
 */
authRoutes.post('/resend-verification', validationMiddleware(resendVerificationSchema), asyncHandler(controller.resendVerification.bind(controller)));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renovar access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens renovados
 *       401:
 *         description: Refresh token inválido
 */
authRoutes.post('/refresh', validationMiddleware(refreshTokenSchema), asyncHandler(controller.refreshToken.bind(controller)));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Terminar sessão
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessão terminada
 */
authRoutes.post('/logout', authMiddleware, asyncHandler(controller.logout.bind(controller)));

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Solicitar recuperação de palavra-passe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email enviado se existir
 */
authRoutes.post('/forgot-password', validationMiddleware(forgotPasswordSchema), asyncHandler(controller.forgotPassword.bind(controller)));

/**
 * @swagger
 * /auth/reset-password-page:
 *   get:
 *     tags: [Auth]
 *     summary: Página HTML para redefinir palavra-passe
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Página HTML com formulário
 */
authRoutes.get('/reset-password-page', controller.resetPasswordPage.bind(controller));

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Redefinir palavra-passe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Palavra-passe redefinida
 *       400:
 *         description: Token inválido ou expirado
 */
authRoutes.post('/reset-password', validationMiddleware(resetPasswordSchema), asyncHandler(controller.resetPassword.bind(controller)));

/**
 * @swagger
 * /auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Login com Google (redireciona para OAuth)
 *     responses:
 *       302:
 *         description: Redireciona para Google
 */
authRoutes.get('/google', controller.googleRedirect.bind(controller));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Callback do Google OAuth
 *     responses:
 *       302:
 *         description: Redireciona para o frontend com tokens
 */
authRoutes.get('/google/callback', asyncHandler(controller.googleCallback.bind(controller)));