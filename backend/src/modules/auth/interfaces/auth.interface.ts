export interface JwtPayload {
    sub: string;
    role: string;
    email: string;
}

export interface EmailTokenPayload {
  sub: string;
  type: 'email_verification' | 'password_reset';
}