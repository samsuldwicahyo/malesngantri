export const BOOKING_STATUSES = [
  'BOOKED',
  'CHECKED_IN',
  'IN_SERVICE',
  'DONE',
  'CANCELED',
  'NO_SHOW',
] as const;

export type QueueStatus = (typeof BOOKING_STATUSES)[number];

export const QUEUE_STATUS_LABEL: Record<QueueStatus, string> = {
  BOOKED: 'Sudah Booking',
  CHECKED_IN: 'Sudah Datang',
  IN_SERVICE: 'Sedang Dilayani',
  DONE: 'Selesai',
  CANCELED: 'Dibatalkan',
  NO_SHOW: 'Tidak Hadir',
};

export const QUEUE_STATUS_HELP: Record<QueueStatus, string> = {
  BOOKED: 'Jadwal sudah dibuat, pelanggan belum datang.',
  CHECKED_IN: 'Pelanggan sudah tiba di lokasi.',
  IN_SERVICE: 'Pelanggan sedang dipotong rambut.',
  DONE: 'Layanan sudah selesai.',
  CANCELED: 'Booking dibatalkan oleh pelanggan/admin.',
  NO_SHOW: 'Pelanggan tidak datang sesuai jadwal.',
};

export const QUEUE_STATUS_BADGE: Record<QueueStatus, string> = {
  BOOKED: 'bg-violet-500/15 text-violet-200 border-violet-500/40',
  CHECKED_IN: 'bg-amber-500/15 text-amber-200 border-amber-500/40',
  IN_SERVICE: 'bg-sky-500/15 text-sky-200 border-sky-500/40',
  DONE: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40',
  CANCELED: 'bg-rose-500/15 text-rose-200 border-rose-500/40',
  NO_SHOW: 'bg-orange-500/15 text-orange-200 border-orange-500/40',
};

export type UserRole = 'SUPER_ADMIN' | 'ADMIN_BARBER' | 'WORKER' | 'CUSTOMER';

export type BookingSource = 'ONLINE' | 'OFFLINE';

export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export type TenantProfile = {
  id: string;
  slug: string;
  name: string;
  city: string;
  address: string;
  whatsapp: string;
  operationalHours: string;
  description?: string;
  coverImageUrl?: string;
  logoImageUrl?: string;
  mapsUrl?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  subscriptionStatus: SubscriptionStatus;
};

export type BarberProfile = {
  id: string;
  name: string;
  username?: string;
  email?: string;
  phone: string;
  socialMedia: string;
  photoUrl: string;
  instagram?: string;
  tiktok?: string;
  description?: string;
  isActive: boolean;
};

export type ServiceItem = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description?: string;
  isActive: boolean;
};

export type ClosedSlot = {
  id: string;
  bookingDate: string;
  slotTime: string;
  barberId: string | null;
  note?: string;
};

export type QueueTicket = {
  id: string;
  bookingCode: string;
  customerName: string;
  customerWhatsapp: string;
  barberId: string;
  serviceId: string;
  bookingDate: string;
  slotTime: string;
  source: BookingSource;
  status: QueueStatus;
  createdAt: string;
};

export type TenantState = {
  tenant: TenantProfile;
  barbers: BarberProfile[];
  services: ServiceItem[];
  closedSlots: ClosedSlot[];
  queues: QueueTicket[];
  updatedAt: string;
};
