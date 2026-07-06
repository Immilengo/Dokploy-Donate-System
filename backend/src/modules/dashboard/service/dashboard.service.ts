import { DashboardRepository } from '../repository/dashboard.repository';

export class DashboardService {
  constructor(private readonly repository = new DashboardRepository()) {}

  async getCounters() {
    return this.repository.getCounters();
  }

  async getSummary() {
    const [
      counters,
      donationsByStatus,
      donationsByCategory,
      donationsByMonth,
      topCollectionPoints,
      topDonors,
      recentDonations,
    ] = await Promise.all([
      this.repository.getCounters(),
      this.repository.getDonationsByStatus(),
      this.repository.getDonationsByCategory(),
      this.repository.getDonationsByMonth(),
      this.repository.getTopCollectionPoints(),
      this.repository.getTopDonors(),
      this.repository.getRecentDonations(),
    ]);

    return {
      counters,
      charts: {
        donationsByStatus,
        donationsByCategory,
        donationsByMonth,
      },
      topCollectionPoints,
      topDonors,
      recentDonations: recentDonations.map((d) => ({
        id: d.id,
        description: d.description,
        category: d.category,
        donationStatus: d.donationStatus,
        user: d.user,
        collectionPoint: d.collectionPoint,
        createdAt: d.createdAt,
      })),
    };
  }
}