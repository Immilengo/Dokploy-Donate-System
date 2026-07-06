export type Role = 'USER' | 'ADMIN';
export type RecordStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';
export type DonationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'RECEIVED'
  | 'IN_DELIVERY'
  | 'DONATED'
  | 'CANCELLED';
export type DonationCategory =
  | 'CLOTHING'
  | 'FOOTWEAR'
  | 'BLANKETS'
  | 'TOYS'
  | 'BOOKS'
  | 'OTHER';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  recordStatus: RecordStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  description?: string;
  schedule?: string;
  recordStatus: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  id: string;
  description: string;
  category: DonationCategory;
  estimatedQuantity?: string;
  donationStatus: DonationStatus;
  adminNote?: string;
  thankYouMessage?: string;
  deliveryImageUrl?: string;
  recordStatus: RecordStatus;
  user: { id: string; fullName: string; email: string };
  collectionPoint: { id: string; name: string; address: string; city: string };
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DashboardCounters {
  donations: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    received: number;
    inDelivery: number;
    donated: number;
    cancelled: number;
  };
  users: { total: number };
  collectionPoints: { total: number; active: number };
}

export interface DashboardSummary {
  counters: DashboardCounters;
  charts: {
    donationsByStatus: { status: string; count: number }[];
    donationsByCategory: { category: string; count: number }[];
    donationsByMonth: { month: string; total: number; donated: number }[];
  };
  topCollectionPoints: { collectionPointId: string; name: string; city: string; count: number }[];
  topDonors: { userId: string; fullName: string; email: string; donationsCompleted: number }[];
  recentDonations: Partial<Donation>[];
}