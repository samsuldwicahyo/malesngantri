import { getTenantSeed } from './demo-data';
import type { QueueStatus, QueueTicket, TenantState } from './types';

const STORAGE_PREFIX = 'malas-ngantri:v2';

const ACTIVE_QUEUE_STATUSES: QueueStatus[] = ['BOOKED', 'CHECKED_IN', 'IN_SERVICE'];

const toMinutes = (slotTime: string): number => {
  const [hours, minutes] = slotTime.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
};

export const isActiveQueueStatus = (status: QueueStatus): boolean => {
  return ACTIVE_QUEUE_STATUSES.includes(status);
};

export const getStorageKey = (slug: string): string => {
  return `${STORAGE_PREFIX}:${slug}`;
};

const normalizeTenantState = (state: TenantState): TenantState => {
  const seed = getTenantSeed(state.tenant.slug);

  return {
    ...state,
    tenant: {
      ...seed.tenant,
      ...state.tenant,
      description: state.tenant.description ?? seed.tenant.description ?? '',
      coverImageUrl: state.tenant.coverImageUrl ?? seed.tenant.coverImageUrl ?? '',
      logoImageUrl: state.tenant.logoImageUrl ?? seed.tenant.logoImageUrl ?? '',
      mapsUrl: state.tenant.mapsUrl ?? seed.tenant.mapsUrl ?? '',
      instagram: state.tenant.instagram ?? seed.tenant.instagram ?? '',
      tiktok: state.tenant.tiktok ?? seed.tenant.tiktok ?? '',
      facebook: state.tenant.facebook ?? seed.tenant.facebook ?? '',
    },
    barbers: state.barbers.map((barber) => ({
      ...barber,
      username: barber.username ?? barber.name.toLowerCase().replace(/\s+/g, '.'),
      email: barber.email ?? '',
      socialMedia: barber.socialMedia || barber.instagram || barber.tiktok || '',
      instagram: barber.instagram ?? '',
      tiktok: barber.tiktok ?? '',
      description: barber.description ?? '',
      isActive: barber.isActive ?? true,
    })),
    services: state.services.map((service) => ({
      ...service,
      description: service.description ?? '',
      isActive: service.isActive ?? true,
    })),
    closedSlots: state.closedSlots ?? [],
  };
};

export const loadTenantState = (slug: string): TenantState => {
  if (typeof window === 'undefined') {
    return normalizeTenantState(getTenantSeed(slug));
  }

  const raw = window.localStorage.getItem(getStorageKey(slug));
  if (!raw) {
    const seed = normalizeTenantState(getTenantSeed(slug));
    persistTenantState(slug, seed);
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as TenantState;
    const normalized = normalizeTenantState(parsed);
    persistTenantState(slug, normalized);
    return normalized;
  } catch {
    const seed = normalizeTenantState(getTenantSeed(slug));
    persistTenantState(slug, seed);
    return seed;
  }
};

export const persistTenantState = (slug: string, state: TenantState): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getStorageKey(slug), JSON.stringify(state));
};

export const getBookingCode = (state: TenantState): string => {
  const latest = state.queues
    .map((item) => Number(item.bookingCode.replace(/^BK-/, '')))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => b - a)[0];

  const next = (latest || 0) + 1;
  return `BK-${next.toString().padStart(4, '0')}`;
};

const sortBooking = (a: QueueTicket, b: QueueTicket): number => {
  const dateCompare = a.bookingDate.localeCompare(b.bookingDate);
  if (dateCompare !== 0) return dateCompare;

  const slotCompare = toMinutes(a.slotTime) - toMinutes(b.slotTime);
  if (slotCompare !== 0) return slotCompare;

  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
};

export const countQueueAhead = (queues: QueueTicket[], currentQueueId: string): number => {
  const current = queues.find((item) => item.id === currentQueueId);
  if (!current) return 0;

  return queues
    .filter((item) => item.id !== current.id)
    .filter((item) => isActiveQueueStatus(item.status))
    .filter((item) => item.barberId === current.barberId)
    .filter((item) => item.bookingDate === current.bookingDate)
    .filter(
      (item) =>
        toMinutes(item.slotTime) < toMinutes(current.slotTime) ||
        (item.slotTime === current.slotTime && new Date(item.createdAt).getTime() < new Date(current.createdAt).getTime()),
    ).length;
};

const ALLOWED_TRANSITIONS: Record<QueueStatus, QueueStatus[]> = {
  BOOKED: ['CHECKED_IN', 'CANCELED', 'NO_SHOW'],
  CHECKED_IN: ['IN_SERVICE', 'NO_SHOW', 'CANCELED'],
  IN_SERVICE: ['DONE'],
  DONE: [],
  CANCELED: [],
  NO_SHOW: [],
};

export const getAllowedTransitions = (status: QueueStatus): QueueStatus[] => {
  return ALLOWED_TRANSITIONS[status];
};

export const updateQueueStatus = (
  state: TenantState,
  queueId: string,
  nextStatus: QueueStatus,
): TenantState => {
  return {
    ...state,
    updatedAt: new Date().toISOString(),
    queues: state.queues.map((item) => {
      if (item.id !== queueId) {
        return item;
      }

      const transitions = getAllowedTransitions(item.status);
      if (!transitions.includes(nextStatus)) {
        return item;
      }

      return {
        ...item,
        status: nextStatus,
      };
    }),
  };
};

export const addQueueTicket = (
  state: TenantState,
  payload: {
    customerName: string;
    customerWhatsapp: string;
    barberId: string;
    serviceId: string;
    bookingDate: string;
    slotTime: string;
    source: 'ONLINE' | 'OFFLINE';
    /** Optional: use server-assigned id so local state matches DB */
    overrideId?: string;
    /** Optional: use server-assigned booking code */
    overrideBookingCode?: string;
  },
): TenantState => {
  const queue: QueueTicket = {
    id: payload.overrideId ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    bookingCode: payload.overrideBookingCode ?? getBookingCode(state),
    customerName: payload.customerName,
    customerWhatsapp: payload.customerWhatsapp,
    barberId: payload.barberId,
    serviceId: payload.serviceId,
    bookingDate: payload.bookingDate,
    slotTime: payload.slotTime,
    source: payload.source,
    status: payload.source === 'OFFLINE' ? 'CHECKED_IN' : 'BOOKED',
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    updatedAt: new Date().toISOString(),
    queues: [...state.queues, queue].sort(sortBooking),
  };
};
