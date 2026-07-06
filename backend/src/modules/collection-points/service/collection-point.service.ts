import { AppError } from '@errors/app-error';
import { CollectionPointRepository } from '../repository/collection-point.repository';
import { CreateCollectionPointDto, UpdateCollectionPointDto } from '../dto/collection-point.dto';
import { toCollectionPointOutput, toCollectionPointsPage } from '../mapper/collection-point.mapper';

export class CollectionPointService {
  constructor(private readonly repository = new CollectionPointRepository()) {}

  async create(input: CreateCollectionPointDto) {
    const point = await this.repository.create({
      name: input.name,
      address: input.address,
      city: input.city,
      description: input.description,
      schedule: input.schedule,
      recordStatus: 'ACTIVE',
    });

    return toCollectionPointOutput(point);
  }

  async getById(id: string) {
    const point = await this.repository.findById(id);
    if (!point) throw new AppError('Ponto de recolha não encontrado', 404);
    return toCollectionPointOutput(point);
  }

  async list(params: {
    page: number;
    size: number;
    recordStatus?: 'ACTIVE' | 'INACTIVE' | 'ALL';
    search?: string;
    city?: string;
  }) {
    const page = params.page ?? 1;
    const size = params.size ?? 10;
    const skip = (page - 1) * size;

    const { items, total } = await this.repository.findMany({
      skip,
      take: size,
      recordStatus: params.recordStatus ?? 'ACTIVE',
      search: params.search,
      city: params.city,
    });

    return toCollectionPointsPage(items, total, page, size);
  }

  async update(id: string, input: UpdateCollectionPointDto) {
    const point = await this.repository.findById(id);
    if (!point) throw new AppError('Ponto de recolha não encontrado', 404);

    const updated = await this.repository.update(id, {
      ...(input.name ? { name: input.name } : {}),
      ...(input.address ? { address: input.address } : {}),
      ...(input.city ? { city: input.city } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.schedule !== undefined ? { schedule: input.schedule } : {}),
      ...(input.recordStatus ? { recordStatus: input.recordStatus } : {}),
    });

    return toCollectionPointOutput(updated);
  }

  async softDelete(id: string) {
    const point = await this.repository.findById(id);
    if (!point) throw new AppError('Ponto de recolha não encontrado', 404);

    // verifica se tem doações pendentes antes de desactivar
    await this.repository.softDelete(id);
  }
}