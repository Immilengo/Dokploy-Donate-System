import { AppError } from '@errors/app-error';
import { UserRepository } from '../repository/user.repository';
import { UpdateProfileDto, UpdateUserbyAdminDto } from '../dto/user.dto';
import { toUserOutput, toUsersPage } from '../mapper/user.mapper';

export class UserService {
  constructor(private readonly repository = new UserRepository()) {}

  async getMe(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) throw new AppError('Utilizador não encontrado', 404);
    return toUserOutput(user);
  }

  async getById(id: string) {
    const user = await this.repository.findById(id);
    if (!user) throw new AppError('Utilizador não encontrado', 404);
    return toUserOutput(user);
  }

  async list(params: {
    page: number;
    size: number;
    recordStatus?: 'ACTIVE' | 'INACTIVE' | 'ALL';
    search?: string;
    role?: 'USER' | 'ADMIN';
  }) {
    const page = params.page ?? 1;
    const size = params.size ?? 10;
    const skip = (page - 1) * size;

    const { items, total } = await this.repository.findMany({
      skip,
      take: size,
      recordStatus: params.recordStatus ?? 'ALL',
      search: params.search,
      role: params.role,
    });

    return toUsersPage(items, total, page, size);
  }

  async updateProfile(userId: string, input: UpdateProfileDto) {
    const user = await this.repository.findById(userId);
    if (!user) throw new AppError('Utilizador não encontrado', 404);

    const updated = await this.repository.update(userId, {
      ...(input.fullName ? { fullName: input.fullName } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
    });

    return toUserOutput(updated);
  }

  async updateByAdmin(id: string, input: UpdateUserbyAdminDto) {
    const user = await this.repository.findById(id);
    if (!user) throw new AppError('Utilizador não encontrado', 404);

    const updated = await this.repository.update(id, {
      ...(input.fullName ? { fullName: input.fullName } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.role ? { role: input.role } : {}),
      ...(input.recordStatus ? { recordStatus: input.recordStatus } : {}),
    });

    return toUserOutput(updated);
  }

  async softDelete(id: string, actorId: string) {
    if (id === actorId) throw new AppError('Não podes eliminar a tua própria conta', 400);

    const user = await this.repository.findById(id);
    if (!user) throw new AppError('Utilizador não encontrado', 404);

    await this.repository.softDelete(id);
  }
}