import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '@config/env';
import { requestContextMiddleware } from '@middlewares/request-context.middleware';
import { errorMiddleware } from '@middlewares/error.middleware';
import { router } from '@shared/router';

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fundação Hubble — API',
      version: '1.0.0',
      description: 'API da plataforma de doações da Fundação Hubble',
    },
    servers: [{ url: `http://localhost:${env.PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['src/modules/**/routes/*.ts', 'src/shared/router.ts'],
});

export const app = express();

const allowedOrigins = env.CORS_ALLOWED_ORIGINS.split(',')
  .map((origin) => origin.trim().replace(/^['"]|['"]$/g, ''))
  .filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(requestContextMiddleware);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', router);

app.use(errorMiddleware);
