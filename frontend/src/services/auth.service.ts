import { api } from '@/lib/api';
import { ApiResponse, User } from '@/types';
import { AuthUser } from '@/store/auth.store';

export const authService = {
  async register(data: { fullName: string; email: string; password: string; phone?: string }) {
    const res = await api.post<ApiResponse<null>>('/auth/register', data);
    return res.data;
  },

    async login(data: { email: string; password: string }) {
    const res = await api.post<ApiResponse<{
      accessToken: string;
      refreshToken: string;
      user: AuthUser;
    }>>('/auth/login', data);
    return res.data;
  },

  async resetPassword(data: { token: string; password: string }) {
  const res = await api.post<ApiResponse<null>>('/auth/reset-password', data);
  return res.data;
  },
  
  async me() {
    const res = await api.get<ApiResponse<User>>('/api/users/me');
    return res.data;
  },

  async logout() {
    const res = await api.post<ApiResponse<null>>('/auth/logout');
    return res.data;
  },

  async forgotPassword(email: string) {
    const res = await api.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return res.data;
  },

  async resendVerification(email: string) {
    const res = await api.post<ApiResponse<null>>('/auth/resend-verification', { email });
    return res.data;
  },
};