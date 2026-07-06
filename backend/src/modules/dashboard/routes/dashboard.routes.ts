import { Router } from 'express';
import { DashboardController } from '../controller/dashboard.controller';
import { authMiddleware } from '@middlewares/auth.middleware';
import { roleMiddleware } from '@middlewares/roles.middleware';
import { asyncHandler } from '@utils/async-handler';

const controller = new DashboardController();
export const dashboardRoutes = Router();

dashboardRoutes.use(authMiddleware);
dashboardRoutes.use(roleMiddleware(['ADMIN']));

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dados agregados para o painel de administração
 */

/**
 * @swagger
 * /api/dashboard/counters:
 *   get:
 *     tags: [Dashboard]
 *     summary: Contadores e indicadores numéricos (admin)
 *     description: >
 *       Retorna contadores rápidos para badges e indicadores.
 *       Recomendado chamar a cada 30 segundos no frontend.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contadores obtidos
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 donations:
 *                   total: 120
 *                   pending: 15
 *                   approved: 10
 *                   rejected: 3
 *                   received: 8
 *                   inDelivery: 5
 *                   donated: 75
 *                   cancelled: 4
 *                 users:
 *                   total: 340
 *                 collectionPoints:
 *                   total: 8
 *                   active: 6
 *       403:
 *         description: Forbidden
 */
dashboardRoutes.get('/counters', asyncHandler(controller.getCounters.bind(controller)));

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Resumo completo do dashboard com gráficos (admin)
 *     description: >
 *       Retorna todos os dados para o dashboard completo incluindo
 *       gráficos de barras, circular, linha, top doadores e top pontos de recolha.
 *       Recomendado chamar ao carregar a página do dashboard.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumo obtido
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 counters: {}
 *                 charts:
 *                   donationsByStatus:
 *                     - status: PENDING
 *                       count: 15
 *                     - status: DONATED
 *                       count: 75
 *                   donationsByCategory:
 *                     - category: CLOTHING
 *                       count: 50
 *                   donationsByMonth:
 *                     - month: "2026-01"
 *                       total: 20
 *                       donated: 15
 *                 topCollectionPoints:
 *                   - name: "Sede Fundação Hubble"
 *                     city: "Luanda"
 *                     count: 45
 *                 topDonors:
 *                   - fullName: "João Silva"
 *                     donationsCompleted: 8
 *                 recentDonations: []
 *       403:
 *         description: Forbidden
 */
dashboardRoutes.get('/summary', asyncHandler(controller.getSummary.bind(controller)));