type DonationWithRelations = {
  id: string;
  description: string;
  category: string;
  estimatedQuantity: string | null;
  donationStatus: string;
  adminNote: string | null;
  thankYouMessage: string | null;
  deliveryImageUrl: string | null;
  recordStatus: string;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; fullName: string; email: string };
  collectionPoint: { id: string; name: string; address: string; city: string };
};

export const toDonationOutput = (donation: DonationWithRelations) => ({
  id: donation.id,
  description: donation.description,
  category: donation.category,
  estimatedQuantity: donation.estimatedQuantity,
  donationStatus: donation.donationStatus,
  adminNote: donation.adminNote,
  thankYouMessage: donation.thankYouMessage,
  deliveryImageUrl: donation.deliveryImageUrl,
  recordStatus: donation.recordStatus,
  user: donation.user,
  collectionPoint: donation.collectionPoint,
  createdAt: donation.createdAt,
  updatedAt: donation.updatedAt,
});

export const toDonationsPage = (
  items: DonationWithRelations[],
  total: number,
  page: number,
  size: number
) => ({
  items: items.map(toDonationOutput),
  total,
  page,
  size,
  totalPages: Math.ceil(total / size),
});