import { AppError } from '@errors/app-error';
import path from 'path';
import { DonationRepository } from '../repository/donation.repository';
import { CollectionPointRepository } from '@modules/collection-points/repository/collection-point.repository';
import { CreateDonationDto, UpdateDonationStatusDto, UpdateDonationDto } from '../dto/donation.dto';
import { toDonationOutput, toDonationsPage } from '../mapper/donation.mapper';
import { DonationStatus } from '@prisma/client';

// transições de status permitidas
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING:     ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED:    ['RECEIVED', 'CANCELLED'],
  REJECTED:    ['APPROVED'],
  RECEIVED:    ['IN_DELIVERY'],
  IN_DELIVERY: ['DONATED'],
  DONATED:     [],
  CANCELLED:   [],
};

const DEFAULT_THANK_YOU = (fullName: string) =>
  `Olá ${fullName}, a tua doação chegou ao destino! Obrigado por ajudares a Fundação Hubble a salvar vidas! 💙`;

export class DonationService {
  constructor(
    private readonly repository = new DonationRepository(),
    private readonly collectionPointRepository = new CollectionPointRepository()
  ) {}

  async create(userId: string, input: CreateDonationDto) {
    const point = await this.collectionPointRepository.findById(input.collectionPointId);
    if (!point) throw new AppError('Ponto de recolha não encontrado', 404);
    if (point.recordStatus !== 'ACTIVE') {
      throw new AppError('Este ponto de recolha está inactivo', 400);
    }

    const donation = await this.repository.create({
      description: input.description,
      category: input.category,
      estimatedQuantity: input.estimatedQuantity,
      donationStatus: 'PENDING',
      recordStatus: 'ACTIVE',
      user: { connect: { id: userId } },
      collectionPoint: { connect: { id: input.collectionPointId } },
    });

    return toDonationOutput(donation);
  }

  async getById(id: string, userId: string, role: string) {
    const donation = await this.repository.findById(id);
    if (!donation) throw new AppError('Doação não encontrada', 404);

    // user só pode ver as suas próprias doações
    if (role !== 'ADMIN' && donation.user.id !== userId) {
      throw new AppError('Forbidden', 403);
    }

    return toDonationOutput(donation);
  }

  // admin — vê todas as doações com filtros
  async listAll(params: {
    page: number;
    size: number;
    donationStatus?: DonationStatus;
    category?: string;
    collectionPointId?: string;
    recordStatus?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  }) {
    const page = params.page ?? 1;
    const size = params.size ?? 10;
    const skip = (page - 1) * size;

    const { items, total } = await this.repository.findMany({
      skip,
      take: size,
      donationStatus: params.donationStatus,
      category: params.category,
      collectionPointId: params.collectionPointId,
      recordStatus: params.recordStatus ?? 'ALL',
    });

    return toDonationsPage(items, total, page, size);
  }

  // user — vê só as suas próprias doações (histórico)
  async listMine(userId: string, params: {
    page: number;
    size: number;
    donationStatus?: DonationStatus;
  }) {
    const page = params.page ?? 1;
    const size = params.size ?? 10;
    const skip = (page - 1) * size;

    const { items, total } = await this.repository.findMany({
      skip,
      take: size,
      userId,
      donationStatus: params.donationStatus,
      recordStatus: 'ALL',
    });

    return toDonationsPage(items, total, page, size);
  }

  async updateStatus(id: string, input: UpdateDonationStatusDto) {
    const donation = await this.repository.findById(id);
    if (!donation) throw new AppError('Doação não encontrada', 404);

    // valida transição de status
    const allowed = ALLOWED_TRANSITIONS[donation.donationStatus] ?? [];
    if (!allowed.includes(input.donationStatus)) {
      throw new AppError(
        `Transição de status inválida: ${donation.donationStatus} → ${input.donationStatus}`,
        400
      );
    }

    // lógica especial ao setar DONATED
    let thankYouMessage = input.thankYouMessage ?? null;
    if (input.donationStatus === 'DONATED') {
      if (input.useDefaultMessage || (!input.thankYouMessage)) {
        thankYouMessage = DEFAULT_THANK_YOU(donation.user.fullName);
      }
    }

    const updated = await this.repository.update(id, {
      donationStatus: input.donationStatus,
      ...(input.adminNote !== undefined ? { adminNote: input.adminNote } : {}),
      ...(thankYouMessage ? { thankYouMessage } : {}),
      ...(input.deliveryImageUrl ? { deliveryImageUrl: input.deliveryImageUrl } : {}),
    });

    return toDonationOutput(updated);
  }

  async uploadDeliveryImage(id: string, file: Express.Multer.File) {
    const donation = await this.repository.findById(id);
    if (!donation) throw new AppError('Doação não encontrada', 404);

    if (!file) throw new AppError('Imagem obrigatória', 400);

    const relativePath = path.posix.join('uploads', 'donations', file.filename);
    const updated = await this.repository.update(id, {
      deliveryImageUrl: `/${relativePath}`,
    });

    return toDonationOutput(updated);
  }

  async update(id: string, input: UpdateDonationDto) {
    const donation = await this.repository.findById(id);
    if (!donation) throw new AppError('Doação não encontrada', 404);

    const updated = await this.repository.update(id, {
      ...(input.adminNote !== undefined ? { adminNote: input.adminNote } : {}),
      ...(input.thankYouMessage !== undefined ? { thankYouMessage: input.thankYouMessage } : {}),
      ...(input.deliveryImageUrl !== undefined ? { deliveryImageUrl: input.deliveryImageUrl } : {}),
    });

    return toDonationOutput(updated);
  }

  async softDelete(id: string) {
    const donation = await this.repository.findById(id);
    if (!donation) throw new AppError('Doação não encontrada', 404);

    const nonDeletable = ['RECEIVED', 'IN_DELIVERY', 'DONATED'];
    if (nonDeletable.includes(donation.donationStatus)) {
      throw new AppError(
        `Não é possível eliminar uma doação com status ${donation.donationStatus}`,
        400
      );
    }

    await this.repository.softDelete(id);
  }
}
