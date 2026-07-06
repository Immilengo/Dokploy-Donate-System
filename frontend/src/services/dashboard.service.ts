import { api } from '@/lib/api';
import { ApiResponse, DashboardCounters, DashboardSummary } from '@/types';

export const dashboardService = {
  async getCounters() {
    const res = await api.get<ApiResponse<DashboardCounters>>('/api/dashboard/counters');
    return res.data;
  },

  async getSummary() {
    const res = await api.get<ApiResponse<DashboardSummary>>('/api/dashboard/summary');
    return res.data;
  },
};