import { Request, Response, NextFunction } from "express";
import { AppError } from "@errors/app-error";

export const roleMiddleware = (roles: string[]) =>
(req: Request, _res: Response, next: NextFunction) =>{
    if(!req.user || !roles.includes(req.user.role)){
        return next(new AppError('Forbidden', 403))
    }
    next();
};