export const QUEUE_STATUSES = [
  'WAITING',
  'CALLED',
  'SERVING',
  'DONE',
  'NO_SHOW',
  'CANCELED',
] as const;

export type QueueStatus = (typeof QUEUE_STATUSES)[number];

export const QUEUE_STATUS_LABEL: Record<QueueStatus, string> = {
  WAITING: 'Menunggu',
  CALLED: 'Dipanggil',
  SERVING: 'Dilayani',
  DONE: 'Selesai',
  NO_SHOW: 'Tidak Hadir',
  CANCELED: 'Dibatalkan',
};

export const QUEUE_STATUS_BADGE: Record<QueueStatus, string> = {
  WAITING: 'bg-slate-500/15 text-slate-200 border-slate-500/40',
  CALLED: 'bg-amber-500/15 text-amber-200 border-amber-500/40',
  SERVING: 'bg-sky-500/15 text-sky-200 border-sky-500/40',
  DONE: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40',
  NO_SHOW: 'bg-orange-500/15 text-orange-200 border-orange-500/40',
  CANCELED: 'bg-rose-500/15 text-rose-200 border-rose-500/40',
};

export type UserRole = 'SUPER_ADMIN' | 'ADMIN_BARBER' | 'BARBER' | 'CUSTOMER';

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
  subscriptionStatus: SubscriptionStatus;
};

export type BarberProfile = {
  id: string;
  name: string;
  phone: string;
  socialMedia: string;
  photoUrl: string;
};

export type ServiceItem = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
};

export type QueueTicket = {
  id: string;
  queueCode: string;
  customerName: string;
  customerWhatsapp: string;
  barberId: string;
  serviceId: string;
  source: BookingSource;
  status: QueueStatus;
  createdAt: string;
};

export type TenantState = {
  tenant: TenantProfile;
  barbers: BarberProfile[];
  services: ServiceItem[];
  queues: QueueTicket[];
  updatedAt: string;
};
