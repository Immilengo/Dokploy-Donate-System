import { api } from '@/lib/api';
import { ApiResponse, CollectionPoint, PageResponse } from '@/types';

export const collectionPointService = {
  async list(params?: { page?: number; size?: number; search?: string; city?: string; recordStatus?: 'ACTIVE' | 'INACTIVE' | 'ALL' }) {
    const res = await api.get<ApiResponse<PageResponse<CollectionPoint>>>('/api/collection-points', { params });
    return res.data;
  },

  async getById(id: string) {
    const res = await api.get<ApiResponse<CollectionPoint>>(`/api/collection-points/${id}`);
    return res.data;
  },

  async create(data: { name: string; address: string; city: string; description?: string; schedule?: string }) {
    const res = await api.post<ApiResponse<CollectionPoint>>('/api/collection-points', data);
    return res.data;
  },

  async update(id: string, data: Partial<{ name: string; address: string; city: string; description: string; schedule: string; recordStatus: string }>) {
    const res = await api.patch<ApiResponse<CollectionPoint>>(`/api/collection-points/${id}`, data);
    return res.data;
  },

  async remove(id: string) {
    const res = await api.delete<ApiResponse<null>>(`/api/collection-points/${id}`);
    return res.data;
  },
};