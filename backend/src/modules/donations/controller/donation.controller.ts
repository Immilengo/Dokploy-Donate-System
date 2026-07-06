import { Request, Response } from 'express';
import { DonationService } from '../service/donation.service';
import { successResponse } from '@utils/response';
import { DonationStatus } from '@prisma/client';

const service = new DonationService();

export class DonationController {
  // POST /api/donations  (user autenticado)
  async create(req: Request, res: Response) {
    const data = await service.create(req.user!.sub, req.body);
    res.status(201).json(successResponse('Doação registada com sucesso', data));
  }

  // GET /api/donations/my  (user — histórico próprio)
  async listMine(req: Request, res: Response) {
    const page = req.query.page ? Number(req.query.page) : 1;
    const size = req.query.size ? Number(req.query.size) : 10;
    const donationStatus = req.query.donationStatus as DonationStatus | undefined;

    const data = await service.listMine(req.user!.sub, { page, size, donationStatus });
    res.json(successResponse('Histórico de doações obtido com sucesso', data));
  }

  // GET /api/donations  (admin — todas)
  async listAll(req: Request, res: Response) {
    const page = req.query.page ? Number(req.query.page) : 1;
    const size = req.query.size ? Number(req.query.size) : 10;
    const donationStatus = req.query.donationStatus as DonationStatus | undefined;
    const category = req.query.category as string | undefined;
    const collectionPointId = req.query.collectionPointId as string | undefined;
    const recordStatus = req.query.recordStatus as 'ACTIVE' | 'INACTIVE' | 'ALL' | undefined;

    const data = await service.listAll({
      page, size, donationStatus, category, collectionPointId, recordStatus,
    });
    res.json(successResponse('Doações obtidas com sucesso', data));
  }

  // GET /api/donations/:id  (user vê a sua, admin vê qualquer)
  async getById(req: Request, res: Response) {
    const data = await service.getById(req.params.id, req.user!.sub, req.user!.role);
    res.json(successResponse('Doação obtida com sucesso', data));
  }

  // PATCH /api/donations/:id/status  (admin)
  async updateStatus(req: Request, res: Response) {
    const data = await service.updateStatus(req.params.id, req.body);
    res.json(successResponse('Status da doação actualizado com sucesso', data));
  }

  // POST /api/donations/:id/delivery-image  (admin)
  async uploadDeliveryImage(req: Request, res: Response) {
    const file = req.file;
    const data = await service.uploadDeliveryImage(req.params.id, file as Express.Multer.File);
    res.json(successResponse('Imagem da entrega enviada com sucesso', data));
  }

  // PATCH /api/donations/:id  (admin)
  async update(req: Request, res: Response) {
    const data = await service.update(req.params.id, req.body);
    res.json(successResponse('Doação actualizada com sucesso', data));
  }

  // DELETE /api/donations/:id  (admin)
  async remove(req: Request, res: Response) {
    await service.softDelete(req.params.id);
    res.json(successResponse('Doação eliminada com sucesso'));
  }
}
