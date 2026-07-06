export interface CreateCollectionPointDto {
  name: string;
  address: string;
  city: string;
  description?: string;
  schedule?: string;
}

export interface UpdateCollectionPointDto {
  name?: string;
  address?: string;
  city?: string;
  description?: string;
  schedule?: string;
  recordStatus?: 'ACTIVE' | 'INACTIVE';
}