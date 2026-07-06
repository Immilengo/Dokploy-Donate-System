import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import {env} from '@config/env';
import { AppError } from "@errors/app-error";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) =>{
    const auth = req.headers.authorization;
    if(!auth) return next(new AppError('Cabeçalho de Auntenticação em Falta, 401'));

    const [type, token] = auth.split(' ');
    if(type !== 'Bearer' || !token) return next(new AppError('Cabeçalho de Autenticação inválido', 401));

    try{
        const payload = jwt.verify(token, env.JWT_SECRET) as {sub: string, role: string};
        req.user = payload;
        next();
    }catch{
        return next(new AppError('Token Inválido', 401));
    }
};