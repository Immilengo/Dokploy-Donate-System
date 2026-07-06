import { Request, Response, NextFunction } from 'express';

type Asyncfn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler = (fn: Asyncfn) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };