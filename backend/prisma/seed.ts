import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findFirst({ where: { email: 'admin@hubble.ao' } });
  if (existing) {
    console.log('Admin já existe, seed ignorado.');
    return;
  }

  const hashed = await bcrypt.hash('Admin123@', 12);
  await prisma.user.create({
    data: {
      fullName: 'Administrador Hubble',
      email: 'admin@hubble.ao',
      password: hashed,
      role: 'ADMIN',
      recordStatus: 'ACTIVE',
      emailVerified: true,
    },
  });

  console.log('Admin criado: admin@hubble.ao / Admin123@');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());