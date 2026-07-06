import { app } from '@infra/http/app';
import { env } from '@config/env';
import { prisma } from '@infra/database/prisma';
import { logger } from '@utils/logger';

const server = app.listen(env.PORT, async () => {
  logger.info({ message: `Fundação Hubble API na porta ${env.PORT}` });

  try {
    await prisma.$connect();
    logger.info({ message: 'Base de dados conectada' });
  } catch (error) {
    logger.warn({
      message: 'Base de dados indisponível',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  logger.info({ message: `Swagger: ${env.BACKEND_PUBLIC_URL}/docs` });
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
