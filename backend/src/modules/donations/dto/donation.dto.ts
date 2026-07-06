export interface CreateDonationDto {
  collectionPointId: string;
  description: string;
  category: 'CLOTHING' | 'FOOTWEAR' | 'BLANKETS' | 'TOYS' | 'BOOKS' | 'OTHER';
  estimatedQuantity?: string;
}

export interface UpdateDonationStatusDto {
  donationStatus: 'APPROVED' | 'REJECTED' | 'RECEIVED' | 'IN_DELIVERY' | 'DONATED' | 'CANCELLED';
  adminNote?: string;
  thankYouMessage?: string;
  deliveryImageUrl?: string;
  useDefaultMessage?: boolean;
}

export interface UpdateDonationDto {
  adminNote?: string;
  thankYouMessage?: string;
  deliveryImageUrl?: string;
}