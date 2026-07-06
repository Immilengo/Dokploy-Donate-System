import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext, makeReq, makeRes } from './helpers';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { roleMiddleware } = require('../src/middlewares/roles.middleware');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { UserService } = require('../src/modules/users/service/user.service');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { CollectionPointService } = require('../src/modules/collection-points/service/collection-point.service');

const { userRepository, collectionPointRepository, cleanDatabase, createUser } = createTestContext();
const userService = new UserService(userRepository as any);
const collectionPointService = new CollectionPointService(collectionPointRepository as any);

beforeEach(async () => {
  await cleanDatabase();
});

test('roleMiddleware bloqueia utilizador comum e aceita admin', async () => {
  const req = makeReq({ user: { sub: '1', role: 'USER' } }) as any;
  let error: any;
  roleMiddleware(['ADMIN'])(req, makeRes(), (err?: any) => {
    error = err;
  });
  assert.ok(error);
  assert.equal(error.statusCode, 403);

  const adminReq = makeReq({ user: { sub: '1', role: 'ADMIN' } }) as any;
  let called = false;
  roleMiddleware(['ADMIN'])(adminReq, makeRes(), () => {
    called = true;
  });
  assert.equal(called, true);
});

test('utilizador vê apenas o próprio perfil', async () => {
  const user = await createUser({
    fullName: 'Perfil',
    email: 'perfil@exemplo.com',
    password: 'Senha1234',
  });

  const profile = await userService.getMe(user.id);
  assert.equal(profile.email, user.email);
});

test('admin atualiza outro utilizador e cria ponto de recolha', async () => {
  const admin = await createUser({
    fullName: 'Admin',
    email: 'admin@exemplo.com',
    password: 'Senha1234',
    role: 'ADMIN',
  });
  const target = await createUser({
    fullName: 'Alvo',
    email: 'alvo@exemplo.com',
    password: 'Senha1234',
  });

  const updated = await userService.updateByAdmin(target.id, {
    fullName: 'Alvo Alterado',
    role: 'USER',
  });

  assert.equal(updated.fullName, 'Alvo Alterado');

  const point = await collectionPointService.create({
    name: 'Ponto Central',
    address: 'Rua 1',
    city: 'Luanda',
  });

  assert.equal(point.name, 'Ponto Central');
  assert.equal(point.city, 'Luanda');
  assert.ok(admin.id);
});
