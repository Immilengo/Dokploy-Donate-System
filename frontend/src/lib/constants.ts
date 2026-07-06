export const DONATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
  RECEIVED: 'Recebida',
  IN_DELIVERY: 'Em Entrega',
  DONATED: 'Doada',
  CANCELLED: 'Cancelada',
};

export const DONATION_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  RECEIVED: 'bg-purple-100 text-purple-800',
  IN_DELIVERY: 'bg-orange-100 text-orange-800',
  DONATED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export const DONATION_CATEGORY_LABELS: Record<string, string> = {
  CLOTHING: 'Roupas',
  FOOTWEAR: 'Calçado',
  BLANKETS: 'Cobertores',
  TOYS: 'Brinquedos',
  BOOKS: 'Livros',
  OTHER: 'Outros',
};

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['RECEIVED', 'CANCELLED'],
  REJECTED: ['APPROVED'],
  RECEIVED: ['IN_DELIVERY'],
  IN_DELIVERY: ['DONATED'],
  DONATED: [],
  CANCELLED: [],
};