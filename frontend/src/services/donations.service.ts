import { api } from '@/lib/api';
import { ApiResponse, Donation, PageResponse, DonationStatus, DonationCategory } from '@/types';

export const donationService = {
  async create(data: {
    collectionPointId: string;
    description: string;
    category: DonationCategory;
    estimatedQuantity?: string;
  }) {
    const res = await api.post<ApiResponse<Donation>>('/api/donations', data);
    return res.data;
  },

  async listMine(params?: { page?: number; size?: number; donationStatus?: DonationStatus }) {
    const res = await api.get<ApiResponse<PageResponse<Donation>>>('/api/donations/my', { params });
    return res.data;
  },

  async listAll(params?: {
    page?: number;
    size?: number;
    donationStatus?: DonationStatus;
    category?: string;
    collectionPointId?: string;
  }) {
    const res = await api.get<ApiResponse<PageResponse<Donation>>>('/api/donations', { params });
    return res.data;
  },

  async getById(id: string) {
    const res = await api.get<ApiResponse<Donation>>(`/api/donations/${id}`);
    return res.data;
  },

  async updateStatus(id: string, data: {
    donationStatus: DonationStatus;
    adminNote?: string;
    useDefaultMessage?: boolean;
    thankYouMessage?: string;
    deliveryImageUrl?: string;
  }) {
    const res = await api.patch<ApiResponse<Donation>>(`/api/donations/${id}/status`, data);
    return res.data;
  },

  async uploadDeliveryImage(id: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post<ApiResponse<Donation>>(`/api/donations/${id}/delivery-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async remove(id: string) {
    const res = await api.delete<ApiResponse<null>>(`/api/donations/${id}`);
    return res.data;
  },
};
