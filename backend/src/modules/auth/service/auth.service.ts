import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { AppError } from '@errors/app-error';
import { MailService } from '@infra/mail/mail.service';
import {
  verificationEmailTemplate,
  resetPasswordTemplate,
  welcomeGoogleTemplate,
} from '@infra/mail/templates';
import { AuthRepository } from '../repository/auth.repository';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { JwtPayload, EmailTokenPayload } from '../interfaces/auth.interface';

const mail = new MailService();

export class AuthService {
  constructor(private readonly repository = new AuthRepository()) {}

  // ─── Tokens ────────────────────────────────────────────────────────────────

  private generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  private generateEmailToken(userId: string, type: EmailTokenPayload['type']): string {
    return jwt.sign({ sub: userId, type }, env.JWT_EMAIL_SECRET, {
      expiresIn: env.JWT_EMAIL_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  private generateResetToken(userId: string): string {
    return jwt.sign({ sub: userId, type: 'password_reset' }, env.JWT_RESET_SECRET, {
      expiresIn: env.JWT_RESET_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  // ─── Register ──────────────────────────────────────────────────────────────

  async register(input: RegisterDto) {
    const existing = await this.repository.findByEmail(input.email);
    if (existing) throw new AppError('Email já registado', 409);

    const hashed = await bcrypt.hash(input.password, 12);
    const user = await this.repository.create({
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      password: hashed,
      phone: input.phone,
      role: 'USER',
      recordStatus: 'ACTIVE',
    });

    const emailToken = this.generateEmailToken(user.id, 'email_verification');
    const { subject, html } = verificationEmailTemplate(user.fullName, emailToken);
    await mail.send({ to: user.email, subject, html });

    return { message: 'Conta criada. Verifica o teu email para activar a conta.' };
  }

  // ─── Verify Email ──────────────────────────────────────────────────────────

  async verifyEmail(token: string) {
    let payload: EmailTokenPayload;
    try {
      payload = jwt.verify(token, env.JWT_EMAIL_SECRET) as EmailTokenPayload;
    } catch {
      return { status: 'invalid' as const, message: 'Este link é inválido ou já expirou. Solicita um novo link de verificação.' };
    }

    if (payload.type !== 'email_verification') {
      return { status: 'invalid' as const, message: 'Link inválido.' };
    }

    const user = await this.repository.findById(payload.sub);
    if (!user) {
      return { status: 'invalid' as const, message: 'Utilizador não encontrado.' };
    }
    if (user.emailVerified) {
      return { status: 'already' as const, fullName: user.fullName };
    }

    await this.repository.update(user.id, { emailVerified: true, recordStatus: 'ACTIVE' });
    return { status: 'ok' as const, fullName: user.fullName };
  }

  // ─── Resend Verification ───────────────────────────────────────────────────

  async resendVerification(email: string) {
    const user = await this.repository.findByEmail(email);
    // resposta genérica para não revelar se o email existe
    if (!user || user.emailVerified) {
      return { message: 'Se o email existir e não estiver verificado, receberás um novo link.' };
    }

    const emailToken = this.generateEmailToken(user.id, 'email_verification');
    const { subject, html } = verificationEmailTemplate(user.fullName, emailToken);
    await mail.send({ to: user.email, subject, html });

    return { message: 'Se o email existir e não estiver verificado, receberás um novo link.' };
  }

  // ─── Login ─────────────────────────────────────────────────────────────────

  async login(input: LoginDto) {
    const user = await this.repository.findByEmail(input.email);
    if (!user || !user.password) throw new AppError('Credenciais inválidas', 401);

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) throw new AppError('Credenciais inválidas', 401);

    if (!user.emailVerified) throw new AppError('Email não verificado. Verifica o teu email.', 403);
    if (user.recordStatus !== 'ACTIVE') throw new AppError('Conta inactiva ou suspensa', 403);

    const accessToken = this.generateAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });
    const refreshToken = this.generateRefreshToken(user.id);

    await this.repository.update(user.id, { refreshToken });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    };
  }

  // ─── Refresh Token ─────────────────────────────────────────────────────────

  async refreshToken(token: string) {
    let payload: { sub: string };
    try {
      payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
    } catch {
      throw new AppError('Refresh token inválido ou expirado', 401);
    }

    const user = await this.repository.findById(payload.sub);
    if (!user || user.refreshToken !== token) {
      throw new AppError('Refresh token inválido', 401);
    }

    const accessToken = this.generateAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });
    const newRefreshToken = this.generateRefreshToken(user.id);
    await this.repository.update(user.id, { refreshToken: newRefreshToken });

    return { accessToken, refreshToken: newRefreshToken };
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  async logout(userId: string) {
    await this.repository.update(userId, { refreshToken: null });
    return { message: 'Sessão terminada com sucesso.' };
  }

  // ─── Forgot Password ───────────────────────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.repository.findByEmail(email);
    // resposta genérica
    if (!user || user.googleId) {
      return { message: 'Se o email existir, receberás um link para redefinir a palavra-passe.' };
    }

    const resetToken = this.generateResetToken(user.id);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await this.repository.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: expires,
    });

    const { subject, html } = resetPasswordTemplate(user.fullName, resetToken);
    await mail.send({ to: user.email, subject, html });

    return { message: 'Se o email existir, receberás um link para redefinir a palavra-passe.' };
  }

  // ─── Reset Password ────────────────────────────────────────────────────────

  async resetPassword(token: string, newPassword: string) {
    let payload: { sub: string };
    try {
      payload = jwt.verify(token, env.JWT_RESET_SECRET) as { sub: string };
    } catch {
      throw new AppError('Token inválido ou expirado', 400);
    }

    const user = await this.repository.findById(payload.sub);
    if (!user || user.resetPasswordToken !== token) {
      throw new AppError('Token inválido', 400);
    }
    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      throw new AppError('Token expirado', 400);
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await this.repository.update(user.id, {
      password: hashed,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      refreshToken: null,
    });

    return { message: 'Palavra-passe redefinida com sucesso. Já podes fazer login.' };
  }

  // ─── Google OAuth ──────────────────────────────────────────────────────────

  async handleGoogleCallback(profile: {
    googleId: string;
    email: string;
    fullName: string;
  }) {
    let user = await this.repository.findByGoogleId(profile.googleId);

    if (!user) {
      user = await this.repository.findByEmail(profile.email);
      if (user) {
        // conta local existente — liga ao Google
        await this.repository.update(user.id, {
          googleId: profile.googleId,
          emailVerified: true,
        });
        user = await this.repository.findById(user.id);
      } else {
        // conta nova via Google
        user = await this.repository.create({
          fullName: profile.fullName,
          email: profile.email.toLowerCase(),
          googleId: profile.googleId,
          role: 'USER',
          recordStatus: 'ACTIVE',
          emailVerified: true,
        });
        const { subject, html } = welcomeGoogleTemplate(user.fullName);
        await mail.send({ to: user.email, subject, html });
      }
    }

    if (!user) throw new AppError('Erro ao processar login com Google', 500);
    if (user.recordStatus !== 'ACTIVE') throw new AppError('Conta inactiva', 403);

    const accessToken = this.generateAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });
    const refreshToken = this.generateRefreshToken(user.id);
    await this.repository.update(user.id, { refreshToken });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    };
  }
}