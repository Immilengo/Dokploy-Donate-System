import { Request, Response } from 'express';
import { UserService } from '../service/user.service';
import { successResponse } from '@utils/response';
import { AppError } from '@errors/app-error';

const service = new UserService();

export class UserController {
  // GET /api/users/me
  async me(req: Request, res: Response) {
    const data = await service.getMe(req.user!.sub);
    res.json(successResponse('Perfil obtido com sucesso', data));
  }

  // GET /api/users/:id  (admin ou próprio user)
  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const isAdmin = req.user!.role === 'ADMIN';
    const isSelf = req.user!.sub === id;

    if (!isAdmin && !isSelf) throw new AppError('Forbidden', 403);

    const data = await service.getById(id);
    res.json(successResponse('Utilizador obtido com sucesso', data));
  }

  // GET /api/users  (só admin)
  async list(req: Request, res: Response) {
    const page = req.query.page ? Number(req.query.page) : 1;
    const size = req.query.size ? Number(req.query.size) : 10;
    const recordStatus = req.query.recordStatus as 'ACTIVE' | 'INACTIVE' | 'ALL' | undefined;
    const search = req.query.search as string | undefined;
    const role = req.query.role as 'USER' | 'ADMIN' | undefined;

    const data = await service.list({ page, size, recordStatus, search, role });
    res.json(successResponse('Utilizadores obtidos com sucesso', data));
  }

  // PATCH /api/users/me  (próprio user actualiza o seu perfil)
  async updateMe(req: Request, res: Response) {
    const data = await service.updateProfile(req.user!.sub, req.body);
    res.json(successResponse('Perfil actualizado com sucesso', data));
  }

  // PATCH /api/users/:id  (só admin)
  async updateByAdmin(req: Request, res: Response) {
    const data = await service.updateByAdmin(req.params.id, req.body);
    res.json(successResponse('Utilizador actualizado com sucesso', data));
  }

  // DELETE /api/users/:id  (só admin, soft delete)
  async remove(req: Request, res: Response) {
    await service.softDelete(req.params.id, req.user!.sub);
    res.json(successResponse('Utilizador eliminado com sucesso'));
  }
}