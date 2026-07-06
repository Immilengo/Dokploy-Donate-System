import { Request, Response } from 'express';
import { CollectionPointService } from '../service/collection-point.service';
import { successResponse } from '@utils/response';

const service = new CollectionPointService();

export class CollectionPointController {
  async create(req: Request, res: Response) {
    const data = await service.create(req.body);
    res.status(201).json(successResponse('Ponto de recolha criado com sucesso', data));
  }

  async list(req: Request, res: Response) {
    const page = req.query.page ? Number(req.query.page) : 1;
    const size = req.query.size ? Number(req.query.size) : 10;
    const recordStatus = req.query.recordStatus as 'ACTIVE' | 'INACTIVE' | 'ALL' | undefined;
    const search = req.query.search as string | undefined;
    const city = req.query.city as string | undefined;

    const data = await service.list({ page, size, recordStatus, search, city });
    res.json(successResponse('Pontos de recolha obtidos com sucesso', data));
  }

  async getById(req: Request, res: Response) {
    const data = await service.getById(req.params.id);
    res.json(successResponse('Ponto de recolha obtido com sucesso', data));
  }

  async update(req: Request, res: Response) {
    const data = await service.update(req.params.id, req.body);
    res.json(successResponse('Ponto de recolha actualizado com sucesso', data));
  }

  async remove(req: Request, res: Response) {
    await service.softDelete(req.params.id);
    res.json(successResponse('Ponto de recolha eliminado com sucesso'));
  }
}