import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';

type Role = 'USER' | 'ADMIN';
type RecordStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';
type DonationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECEIVED' | 'IN_DELIVERY' | 'DONATED' | 'CANCELLED';
type DonationCategory = 'CLOTHING' | 'FOOTWEAR' | 'BLANKETS' | 'TOYS' | 'BOOKS' | 'OTHER';

type TestUser = {
  id: string;
  fullName: string;
  email: string;
  password: string | null;
  phone: string | null;
  role: Role;
  recordStatus: RecordStatus;
  emailVerified: boolean;
  googleId: string | null;
  refreshToken: string | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  deleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type TestCollectionPoint = {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string | null;
  schedule: string | null;
  recordStatus: RecordStatus;
  deleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type TestDonation = {
  id: string;
  userId: string;
  collectionPointId: string;
  description: string;
  category: DonationCategory;
  estimatedQuantity: string | null;
  donationStatus: DonationStatus;
  adminNote: string | null;
  thankYouMessage: string | null;
  deliveryImageUrl: string | null;
  recordStatus: RecordStatus;
  deleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: Pick<TestUser, 'id' | 'fullName' | 'email'>;
  collectionPoint: Pick<TestCollectionPoint, 'id' | 'name' | 'address' | 'city'>;
};

type TestStore = {
  users: Map<string, TestUser>;
  collectionPoints: Map<string, TestCollectionPoint>;
  donations: Map<string, TestDonation>;
};

const now = () => new Date();

const cloneDate = (date: Date) => new Date(date.getTime());

const cloneUser = (user: TestUser): TestUser => ({
  ...user,
  createdAt: cloneDate(user.createdAt),
  updatedAt: cloneDate(user.updatedAt),
  resetPasswordExpires: user.resetPasswordExpires ? cloneDate(user.resetPasswordExpires) : null,
  deletedAt: user.deletedAt ? cloneDate(user.deletedAt) : null,
});

const cloneCollectionPoint = (point: TestCollectionPoint): TestCollectionPoint => ({
  ...point,
  createdAt: cloneDate(point.createdAt),
  updatedAt: cloneDate(point.updatedAt),
  deletedAt: point.deletedAt ? cloneDate(point.deletedAt) : null,
});

const cloneDonation = (donation: TestDonation): TestDonation => ({
  ...donation,
  createdAt: cloneDate(donation.createdAt),
  updatedAt: cloneDate(donation.updatedAt),
  deletedAt: donation.deletedAt ? cloneDate(donation.deletedAt) : null,
  user: { ...donation.user },
  collectionPoint: { ...donation.collectionPoint },
});

export const createTestStore = (): TestStore => ({
  users: new Map(),
  collectionPoints: new Map(),
  donations: new Map(),
});

const resetStore = (store: TestStore) => {
  store.users.clear();
  store.collectionPoints.clear();
  store.donations.clear();
};

const createUserRecord = async (input: {
  fullName: string;
  email: string;
  password?: string;
  role?: Role;
  emailVerified?: boolean;
  phone?: string | null;
  googleId?: string | null;
}): Promise<TestUser> => ({
  id: randomUUID(),
  fullName: input.fullName,
  email: input.email.toLowerCase(),
  password: input.password ? await bcrypt.hash(input.password, 12) : null,
  phone: input.phone ?? null,
  role: input.role ?? 'USER',
  recordStatus: 'ACTIVE',
  emailVerified: input.emailVerified ?? true,
  googleId: input.googleId ?? null,
  refreshToken: null,
  resetPasswordToken: null,
  resetPasswordExpires: null,
  deleted: false,
  deletedAt: null,
  createdAt: now(),
  updatedAt: now(),
});

const createCollectionPointRecord = (input: {
  name: string;
  address: string;
  city: string;
  description?: string | null;
  schedule?: string | null;
  recordStatus?: RecordStatus;
}): TestCollectionPoint => ({
  id: randomUUID(),
  name: input.name,
  address: input.address,
  city: input.city,
  description: input.description ?? null,
  schedule: input.schedule ?? null,
  recordStatus: input.recordStatus ?? 'ACTIVE',
  deleted: false,
  deletedAt: null,
  createdAt: now(),
  updatedAt: now(),
});

const createDonationRecord = (input: {
  user: TestUser;
  collectionPoint: TestCollectionPoint;
  description: string;
  category: DonationCategory;
  estimatedQuantity?: string | null;
  donationStatus?: DonationStatus;
  adminNote?: string | null;
  thankYouMessage?: string | null;
  deliveryImageUrl?: string | null;
  recordStatus?: RecordStatus;
}): TestDonation => ({
  id: randomUUID(),
  userId: input.user.id,
  collectionPointId: input.collectionPoint.id,
  description: input.description,
  category: input.category,
  estimatedQuantity: input.estimatedQuantity ?? null,
  donationStatus: input.donationStatus ?? 'PENDING',
  adminNote: input.adminNote ?? null,
  thankYouMessage: input.thankYouMessage ?? null,
  deliveryImageUrl: input.deliveryImageUrl ?? null,
  recordStatus: input.recordStatus ?? 'ACTIVE',
  deleted: false,
  deletedAt: null,
  createdAt: now(),
  updatedAt: now(),
  user: {
    id: input.user.id,
    fullName: input.user.fullName,
    email: input.user.email,
  },
  collectionPoint: {
    id: input.collectionPoint.id,
    name: input.collectionPoint.name,
    address: input.collectionPoint.address,
    city: input.collectionPoint.city,
  },
});

class InMemoryAuthRepository {
  constructor(private readonly store: TestStore) {}

  async findByEmail(email: string) {
    const found = [...this.store.users.values()].find((user) => user.email === email.toLowerCase() && !user.deleted);
    return found ? cloneUser(found) : null;
  }

  async findById(id: string) {
    const user = this.store.users.get(id);
    return user ? cloneUser(user) : null;
  }

  async create(data: {
    fullName: string;
    email: string;
    password?: string | null;
    phone?: string | null;
    role?: Role;
    recordStatus?: RecordStatus;
    emailVerified?: boolean;
    googleId?: string | null;
  }) {
    const user: TestUser = {
      id: randomUUID(),
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      password: data.password ?? null,
      phone: data.phone ?? null,
      role: data.role ?? 'USER',
      recordStatus: data.recordStatus ?? 'ACTIVE',
      emailVerified: data.emailVerified ?? false,
      googleId: data.googleId ?? null,
      refreshToken: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      deleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    };
    this.store.users.set(user.id, user);
    return cloneUser(user);
  }

  async findByGoogleId(googleId: string) {
    const found = [...this.store.users.values()].find((user) => user.googleId === googleId && !user.deleted);
    return found ? cloneUser(found) : null;
  }

  async update(id: string, data: Partial<TestUser>) {
    const user = this.store.users.get(id);
    if (!user) throw new Error('User not found');

    const updated = {
      ...user,
      ...data,
      updatedAt: now(),
      email: data.email ? data.email.toLowerCase() : user.email,
    };
    this.store.users.set(id, updated);
    return cloneUser(updated);
  }

  async updateGoogleId(id: string, googleId: string) {
    return this.update(id, { googleId });
  }
}

class InMemoryUserRepository {
  constructor(private readonly store: TestStore) {}

  async findById(id: string) {
    const user = this.store.users.get(id);
    return user && !user.deleted ? cloneUser(user) : null;
  }

  async findMany(params: {
    skip: number;
    take: number;
    recordStatus?: 'ACTIVE' | 'INACTIVE' | 'ALL';
    search?: string;
    role?: Role;
  }) {
    const search = params.search?.toLowerCase();
    const items = [...this.store.users.values()]
      .filter((user) => !user.deleted)
      .filter((user) => (params.recordStatus && params.recordStatus !== 'ALL' ? user.recordStatus === params.recordStatus : true))
      .filter((user) => (params.role ? user.role === params.role : true))
      .filter((user) =>
        search
          ? user.fullName.toLowerCase().includes(search) || user.email.toLowerCase().includes(search)
          : true
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      items: items.slice(params.skip, params.skip + params.take).map(cloneUser),
      total: items.length,
    };
  }

  async update(id: string, data: Partial<TestUser>) {
    const user = this.store.users.get(id);
    if (!user) throw new Error('User not found');

    const updated: TestUser = {
      ...user,
      ...data,
      email: data.email ? data.email.toLowerCase() : user.email,
      updatedAt: now(),
      deletedAt: data.deletedAt ?? user.deletedAt,
    };
    this.store.users.set(id, updated);
    return cloneUser(updated);
  }

  async softDelete(id: string) {
    const user = this.store.users.get(id);
    if (!user) throw new Error('User not found');

    const updated: TestUser = {
      ...user,
      deleted: true,
      deletedAt: now(),
      recordStatus: 'DELETED',
      updatedAt: now(),
    };
    this.store.users.set(id, updated);
    return cloneUser(updated);
  }
}

class InMemoryCollectionPointRepository {
  constructor(private readonly store: TestStore) {}

  async create(data: {
    name: string;
    address: string;
    city: string;
    description?: string | null;
    schedule?: string | null;
    recordStatus?: RecordStatus;
  }) {
    const point = createCollectionPointRecord(data);
    this.store.collectionPoints.set(point.id, point);
    return cloneCollectionPoint(point);
  }

  async findById(id: string) {
    const point = this.store.collectionPoints.get(id);
    return point && !point.deleted ? cloneCollectionPoint(point) : null;
  }

  async findMany(params: {
    skip: number;
    take: number;
    recordStatus?: 'ACTIVE' | 'INACTIVE' | 'ALL';
    search?: string;
    city?: string;
  }) {
    const search = params.search?.toLowerCase();
    const city = params.city?.toLowerCase();
    const items = [...this.store.collectionPoints.values()]
      .filter((point) => !point.deleted)
      .filter((point) => (params.recordStatus && params.recordStatus !== 'ALL' ? point.recordStatus === params.recordStatus : true))
      .filter((point) => (city ? point.city.toLowerCase().includes(city) : true))
      .filter((point) =>
        search
          ? point.name.toLowerCase().includes(search) ||
            point.address.toLowerCase().includes(search) ||
            point.city.toLowerCase().includes(search)
          : true
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      items: items.slice(params.skip, params.skip + params.take).map(cloneCollectionPoint),
      total: items.length,
    };
  }

  async update(id: string, data: Partial<TestCollectionPoint>) {
    const point = this.store.collectionPoints.get(id);
    if (!point) throw new Error('Collection point not found');

    const updated: TestCollectionPoint = {
      ...point,
      ...data,
      updatedAt: now(),
    };
    this.store.collectionPoints.set(id, updated);
    return cloneCollectionPoint(updated);
  }

  async softDelete(id: string) {
    const point = this.store.collectionPoints.get(id);
    if (!point) throw new Error('Collection point not found');

    const updated: TestCollectionPoint = {
      ...point,
      deleted: true,
      deletedAt: now(),
      recordStatus: 'DELETED',
      updatedAt: now(),
    };
    this.store.collectionPoints.set(id, updated);
    return cloneCollectionPoint(updated);
  }
}

class InMemoryDonationRepository {
  constructor(private readonly store: TestStore) {}

  async create(data: {
    description: string;
    category: DonationCategory;
    estimatedQuantity?: string | null;
    donationStatus?: DonationStatus;
    recordStatus?: RecordStatus;
    user: { connect: { id: string } };
    collectionPoint: { connect: { id: string } };
  }) {
    const user = this.store.users.get(data.user.connect.id);
    const point = this.store.collectionPoints.get(data.collectionPoint.connect.id);
    if (!user || !point) throw new Error('Missing relation');

    const donation = createDonationRecord({
      user,
      collectionPoint: point,
      description: data.description,
      category: data.category,
      estimatedQuantity: data.estimatedQuantity ?? null,
      donationStatus: data.donationStatus ?? 'PENDING',
      recordStatus: data.recordStatus ?? 'ACTIVE',
    });
    this.store.donations.set(donation.id, donation);
    return cloneDonation(donation);
  }

  async findById(id: string) {
    const donation = this.store.donations.get(id);
    return donation && !donation.deleted ? cloneDonation(donation) : null;
  }

  async findMany(params: {
    skip: number;
    take: number;
    userId?: string;
    collectionPointId?: string;
    donationStatus?: DonationStatus;
    category?: string;
    recordStatus?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  }) {
    const items = [...this.store.donations.values()]
      .filter((donation) => !donation.deleted)
      .filter((donation) => (params.userId ? donation.userId === params.userId : true))
      .filter((donation) => (params.collectionPointId ? donation.collectionPointId === params.collectionPointId : true))
      .filter((donation) => (params.donationStatus ? donation.donationStatus === params.donationStatus : true))
      .filter((donation) => (params.category ? donation.category === params.category : true))
      .filter((donation) => (params.recordStatus && params.recordStatus !== 'ALL' ? donation.recordStatus === params.recordStatus : true))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      items: items.slice(params.skip, params.skip + params.take).map(cloneDonation),
      total: items.length,
    };
  }

  async update(id: string, data: Partial<TestDonation>) {
    const donation = this.store.donations.get(id);
    if (!donation) throw new Error('Donation not found');

    const updated: TestDonation = {
      ...donation,
      ...data,
      updatedAt: now(),
      user: data.user ? { ...data.user } : donation.user,
      collectionPoint: data.collectionPoint ? { ...data.collectionPoint } : donation.collectionPoint,
    };
    this.store.donations.set(id, updated);
    return cloneDonation(updated);
  }

  async softDelete(id: string) {
    const donation = this.store.donations.get(id);
    if (!donation) throw new Error('Donation not found');

    const updated: TestDonation = {
      ...donation,
      deleted: true,
      deletedAt: now(),
      recordStatus: 'DELETED',
      updatedAt: now(),
    };
    this.store.donations.set(id, updated);
    return cloneDonation(updated);
  }
}

export const createTestContext = () => {
  const store = createTestStore();

  return {
    store,
    cleanDatabase: async () => {
      resetStore(store);
    },
    authRepository: new InMemoryAuthRepository(store),
    userRepository: new InMemoryUserRepository(store),
    collectionPointRepository: new InMemoryCollectionPointRepository(store),
    donationRepository: new InMemoryDonationRepository(store),
    createUser: async (input: {
      fullName: string;
      email: string;
      password?: string;
      role?: Role;
      emailVerified?: boolean;
      phone?: string | null;
      googleId?: string | null;
    }) => {
      const user = await createUserRecord(input);
      store.users.set(user.id, user);
      return cloneUser(user);
    },
    createCollectionPoint: async (input: {
      name: string;
      address: string;
      city: string;
      description?: string | null;
      schedule?: string | null;
      recordStatus?: RecordStatus;
    }) => {
      const point = createCollectionPointRecord(input);
      store.collectionPoints.set(point.id, point);
      return cloneCollectionPoint(point);
    },
  };
};

export const makeReq = (overrides: Record<string, any> = {}) => ({
  headers: {},
  query: {},
  body: {},
  params: {},
  user: undefined,
  ...overrides,
});

export const makeRes = () => {
  const res: any = {};
  res.statusCode = 200;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload: any) => {
    res.payload = payload;
    return res;
  };
  res.send = (payload: any) => {
    res.payload = payload;
    return res;
  };
  res.redirect = (url: string) => {
    res.redirectedTo = url;
    return res;
  };
  return res;
};
