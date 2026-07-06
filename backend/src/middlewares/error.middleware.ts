import { Request, Response, NextFunction } from 'express';
import { AppError } from '@errors/app-error';
import { logger } from '@utils/logger';
import { errorResponse } from '@utils/response';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof AppError) {
    logger.warn({ message: error.message, statusCode: error.statusCode });
    return res.status(error.statusCode).json(errorResponse(error.message, error.errors));
  }
  logger.error({ message: error.message, stack: error.stack });
  return res.status(500).json(errorResponse('Internal server error'));
};