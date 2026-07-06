import { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';
import { UserService } from '@modules/users/service/user.service';
import { successResponse } from '@utils/response';
import { env } from '@config/env';
import jwt from 'jsonwebtoken';
import { AppError } from '@errors/app-error';
import {
  verifiedPage,
  alreadyVerifiedPage,
  invalidTokenPage,
  resetPasswordPage,
  resetSuccessPage,
} from '@infra/http/pages';


const service = new AuthService();
const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response) {
    const data = await service.register(req.body);
    res.status(201).json(successResponse(data.message));
  }

  async login(req: Request, res: Response) {
    const data = await service.login(req.body);
    res.json(successResponse('Login efectuado com sucesso', data));
  }

  async me(req: Request, res: Response) {
    const data = await userService.getMe(req.user!.sub);
    res.json(successResponse('Utilizador autenticado', data));
  }

  async verifyEmail(req: Request, res: Response) {
    const { token } = req.query as { token: string };
    if (!token) {
      return res.status(400).send(invalidTokenPage('Token não fornecido.'));
    }

    const result = await service.verifyEmail(token);

    if (result.status === 'invalid') {
      return res.status(400).send(invalidTokenPage(result.message));
    }
    if (result.status === 'already') {
      return res.send(alreadyVerifiedPage());
    }
    return res.send(verifiedPage(result.fullName));
  }

  async resendVerification(req: Request, res: Response) {
    const data = await service.resendVerification(req.body.email);
    res.json(successResponse(data.message));
  }

  async refreshToken(req: Request, res: Response) {
    const data = await service.refreshToken(req.body.refreshToken);
    res.json(successResponse('Token renovado', data));
  }

  async logout(req: Request, res: Response) {
    const data = await service.logout(req.user!.sub);
    res.json(successResponse(data.message));
  }

  async forgotPassword(req: Request, res: Response) {
    const data = await service.forgotPassword(req.body.email);
    res.json(successResponse(data.message));
  }

  async resetPassword(req: Request, res: Response) {
    const { token, password } = req.body;
    try {
      const data = await service.resetPassword(token, password);

      const contentTypeHeader = req.headers['content-type'];
      const wantsHtml = req.headers.accept?.includes('text/html') ||
        (typeof contentTypeHeader === 'string' && contentTypeHeader.includes('application/x-www-form-urlencoded'));

      if (wantsHtml) {
        return res.send(resetSuccessPage());
      }

      return res.json(successResponse(data.message));
    } catch (error: unknown) {
      const contentTypeHeader = req.headers['content-type'];
      const wantsHtml = req.headers.accept?.includes('text/html') ||
        (typeof contentTypeHeader === 'string' && contentTypeHeader.includes('application/x-www-form-urlencoded'));

      if (wantsHtml) {
        const message = error instanceof Error ? error.message : 'Erro ao redefinir palavra-passe.';
        return res.status(error instanceof AppError ? error.statusCode : 400).send(invalidTokenPage(message));
      }

      throw error;
    }
  }

  // nova página de reset — GET que serve o formulário HTML
  resetPasswordPage(req: Request, res: Response) {
    const { token } = req.query as { token: string };
    if (!token) {
      return res.status(400).send(invalidTokenPage('Token não fornecido.'));
    }
    return res.send(resetPasswordPage(token));
  }
  // Google OAuth — redireciona para o Google
  googleRedirect(_req: Request, res: Response) {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CALLBACK_URL) {
      return res.redirect(`${env.FRONTEND_URL}/auth/login?error=google_failed`);
    }

    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  }

  // Google OAuth — recebe o code, troca por token, cria/loga user
  async googleCallback(req: Request, res: Response) {
    const { code } = req.query as { code: string };
    if (!code) {
      return res.redirect(`${env.FRONTEND_URL}/auth/login?error=google_failed`);
    }

    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
      return res.redirect(`${env.FRONTEND_URL}/auth/login?error=google_failed`);
    }

    // troca o code por tokens do Google
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errorBody = await tokenRes.text();
      console.error('Google OAuth token exchange failed', { status: tokenRes.status, body: errorBody });
      return res.redirect(`${env.FRONTEND_URL}/auth/login?error=google_failed`);
    }

    const tokenData = await tokenRes.json() as { id_token?: string; error?: string; error_description?: string };
    if (!tokenData.id_token) {
      console.error('Google OAuth token response missing id_token', tokenData);
      return res.redirect(`${env.FRONTEND_URL}/auth/login?error=google_failed`);
    }

    // decode o id_token (não precisa de verificar assinatura aqui — o Google já validou)
    const googlePayload = jwt.decode(tokenData.id_token) as {
      sub: string;
      email: string;
      name: string;
    };

    const data = await service.handleGoogleCallback({
      googleId: googlePayload.sub,
      email: googlePayload.email,
      fullName: googlePayload.name,
    });

    // redireciona para o frontend com os tokens
    const params = new URLSearchParams({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    res.redirect(`${env.FRONTEND_URL}/auth/callback?${params}`);
  }
}
