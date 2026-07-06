import test, { after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { cleanDatabase, createUser, makeReq, makeRes } from './helpers';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { prisma } = require('../src/infra/database/prisma');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AuthService } = require('../src/modules/auth/service/auth.service');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { authMiddleware } = require('../src/middlewares/auth.middleware');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { env } = require('../src/config/env');

const service = new AuthService();

after(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await cleanDatabase();
});

test('cadastro cria conta com role USER', async () => {
  const result = await service.register({
    fullName: 'Novo Utilizador',
    email: 'novo@exemplo.com',
    password: 'Senha1234',
  });

  assert.match(result.message, /Conta criada/i);
  const user = await prisma.user.findUnique({ where: { email: 'novo@exemplo.com' } });
  assert.equal(user?.role, 'USER');
});

test('login devolve access token e refresh token', async () => {
  await createUser({
    fullName: 'Utilizador Login',
    email: 'login@exemplo.com',
    password: 'Senha1234',
    emailVerified: true,
  });

  const result = await service.login({ email: 'login@exemplo.com', password: 'Senha1234' });
  assert.ok(result.accessToken);
  assert.ok(result.refreshToken);
  assert.equal(result.user.email, 'login@exemplo.com');
});

test('forgot-password e reset-password funcionam no fluxo completo', async () => {
  const user = await createUser({
    fullName: 'Recuperar Senha',
    email: 'reset@exemplo.com',
    password: 'Senha1234',
    emailVerified: true,
  });

  const forgot = await service.forgotPassword(user.email);
  assert.match(forgot.message, /Se o email existir/i);

  const refreshed = await prisma.user.findUnique({ where: { id: user.id } });
  assert.ok(refreshed?.resetPasswordToken);

  const reset = await service.resetPassword(refreshed!.resetPasswordToken!, 'NovaSenha123');
  assert.match(reset.message, /redefinir/i);

  const relogin = await service.login({ email: user.email, password: 'NovaSenha123' });
  assert.ok(relogin.accessToken);
});

test('authMiddleware aceita token válido e rejeita token inválido', async () => {
  const token = jwt.sign({ sub: 'abc', role: 'USER' }, env.JWT_SECRET);
  const req = makeReq({ headers: { authorization: `Bearer ${token}` } }) as any;
  const res = makeRes();
  let nextCalled = false;

  authMiddleware(req, res, (err?: any) => {
    assert.equal(err, undefined);
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.sub, 'abc');

  const badReq = makeReq({ headers: { authorization: 'Bearer invalido' } }) as any;
  const badRes = makeRes();
  let badError: any;
  authMiddleware(badReq, badRes, (err?: any) => {
    badError = err;
  });

  assert.ok(badError);
  assert.equal(badError.statusCode, 401);
});
