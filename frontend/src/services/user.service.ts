import { api } from '@/lib/api';
import { ApiResponse, User, PageResponse } from '@/types';

export const userService = {
  async list(params?: { page?: number; size?: number; search?: string; role?: string; recordStatus?: string }) {
    const res = await api.get<ApiResponse<PageResponse<User>>>('/api/users', { params });
    return res.data;
  },

  async getById(id: string) {
    const res = await api.get<ApiResponse<User>>(`/api/users/${id}`);
    return res.data;
  },

  async updateMe(data: { fullName?: string; phone?: string }) {
    const res = await api.patch<ApiResponse<User>>('/api/users/me', data);
    return res.data;
  },

  async updateByAdmin(id: string, data: { fullName?: string; phone?: string; role?: string; recordStatus?: string }) {
    const res = await api.patch<ApiResponse<User>>(`/api/users/${id}`, data);
    return res.data;
  },

  async remove(id: string) {
    const res = await api.delete<ApiResponse<null>>(`/api/users/${id}`);
    return res.data;
  },
};