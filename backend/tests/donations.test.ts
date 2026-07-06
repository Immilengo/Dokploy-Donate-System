import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from './helpers';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DonationService } = require('../src/modules/donations/service/donation.service');

const { donationRepository, collectionPointRepository, cleanDatabase, createUser, createCollectionPoint } = createTestContext();
const service = new DonationService(donationRepository as any, collectionPointRepository as any);

beforeEach(async () => {
  await cleanDatabase();
});

test('utilizador autenticado cria doação e a consulta no histórico', async () => {
  const user = await createUser({
    fullName: 'Doador',
    email: 'doador@exemplo.com',
    password: 'Senha1234',
  });
  const point = await createCollectionPoint({
    name: 'Ponto',
    address: 'Rua Principal',
    city: 'Luanda',
  });

  const donation = await service.create(user.id, {
    collectionPointId: point.id,
    description: 'Doação de roupas em bom estado',
    category: 'CLOTHING',
    estimatedQuantity: '2 sacos',
  });

  assert.equal(donation.donationStatus, 'PENDING');

  const history = await service.listMine(user.id, { page: 1, size: 10 });
  assert.equal(history.items.length, 1);
});

test('admin atualiza status da doação e adiciona imagem de entrega', async () => {
  const user = await createUser({
    fullName: 'Doador Final',
    email: 'final@exemplo.com',
    password: 'Senha1234',
  });
  const point = await createCollectionPoint({
    name: 'Ponto 2',
    address: 'Rua 2',
    city: 'Huambo',
  });
  const donation = await service.create(user.id, {
    collectionPointId: point.id,
    description: 'Livros escolares',
    category: 'BOOKS',
  });

  const approved = await service.updateStatus(donation.id, {
    donationStatus: 'APPROVED',
  });
  assert.equal(approved.donationStatus, 'APPROVED');

  const donated = await service.updateStatus(donation.id, {
    donationStatus: 'RECEIVED',
  });
  assert.equal(donated.donationStatus, 'RECEIVED');
});

test('uploadDeliveryImage grava a URL pública da imagem', async () => {
  const user = await createUser({
    fullName: 'Imagem',
    email: 'imagem@exemplo.com',
    password: 'Senha1234',
  });
  const point = await createCollectionPoint({
    name: 'Ponto 3',
    address: 'Rua 3',
    city: 'Benguela',
  });
  const donation = await service.create(user.id, {
    collectionPointId: point.id,
    description: 'Cobertores',
    category: 'BLANKETS',
  });

  const updated = await service.uploadDeliveryImage(donation.id, {
    filename: 'delivery.png',
  } as any);

  assert.equal(updated.deliveryImageUrl, '/uploads/donations/delivery.png');
});
