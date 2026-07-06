import './test-env';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { prisma } = require('../src/infra/database/prisma');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

export const cleanDatabase = async () => {
  await prisma.donation.deleteMany();
  await prisma.collectionPoint.deleteMany();
  await prisma.user.deleteMany();
};

export const createUser = async (input: {
  fullName: string;
  email: string;
  password?: string;
  role?: 'USER' | 'ADMIN';
  emailVerified?: boolean;
}) => {
  const password = input.password ?? 'Senha1234';
  return prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      password: await bcrypt.hash(password, 12),
      role: input.role ?? 'USER',
      emailVerified: input.emailVerified ?? true,
      recordStatus: 'ACTIVE',
    },
  });
};

export const makeReq = (overrides: Record<string, any> = {}) => ({
  headers: {},
  query: {},
  body: {},
  params: {},
  user: undefined,
  ...overrides,
});

export const makeRes = () => {
  const res: any = {};
  res.statusCode = 200;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload: any) => {
    res.payload = payload;
    return res;
  };
  res.send = (payload: any) => {
    res.payload = payload;
    return res;
  };
  res.redirect = (url: string) => {
    res.redirectedTo = url;
    return res;
  };
  return res;
};
