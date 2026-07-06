import { Router } from 'express';
import { authRoutes } from '@modules/auth/routes/auth.routes';
import { userRoutes } from '@modules/users/routes/user.routes';
import { collectionPointRoutes } from '@modules/collection-points/routes/collection-point.routes';
import { donationRoutes } from '@modules/donations/routes/donation.routes';
import { dashboardRoutes } from '@modules/dashboard/routes/dashboard.routes';

export const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Verifica o status da API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API saudável
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: up
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', (_req, res) => {
  res.json({ status: 'up', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/collection-points', collectionPointRoutes);
router.use('/api/donations', donationRoutes);
router.use('/api/dashboard', dashboardRoutes);