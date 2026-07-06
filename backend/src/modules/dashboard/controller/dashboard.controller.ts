import { Request, Response } from 'express';
import { DashboardService } from '../service/dashboard.service';
import { successResponse } from '@utils/response';

const service = new DashboardService();

export class DashboardController {
  // GET /api/dashboard/counters
  // usado para badges e indicadores que actualizam frequentemente
  async getCounters(req: Request, res: Response) {
    const data = await service.getCounters();
    res.json(successResponse('Contadores obtidos com sucesso', data));
  }

  // GET /api/dashboard/summary
  // usado para carregar o dashboard completo com todos os gráficos
  async getSummary(req: Request, res: Response) {
    const data = await service.getSummary();
    res.json(successResponse('Resumo do dashboard obtido com sucesso', data));
  }
}