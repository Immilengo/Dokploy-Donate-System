import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@errors/app-error';

export const validationMiddleware =
  (schema: ZodSchema, source: 'body' | 'query' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const data = source === 'query' ? req.query : req.body;
    if (source === 'body' && !data) {
      return next(new AppError('Request body ausente', 400));
    }
    const result = schema.safeParse(data);
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join(', ');
      return next(new AppError(messages, 400));
    }
    next();
  };