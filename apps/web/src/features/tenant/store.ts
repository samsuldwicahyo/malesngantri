import { getTenantSeed } from './demo-data';
import type { QueueStatus, QueueTicket, TenantState } from './types';

const STORAGE_PREFIX = 'malas-ngantri:v1';

const ACTIVE_QUEUE_STATUSES: QueueStatus[] = ['WAITING', 'CALLED', 'SERVING'];

export const isActiveQueueStatus = (status: QueueStatus): boolean => {
  return ACTIVE_QUEUE_STATUSES.includes(status);
};

export const getStorageKey = (slug: string): string => {
  return `${STORAGE_PREFIX}:${slug}`;
};

export const loadTenantState = (slug: string): TenantState => {
  if (typeof window === 'undefined') {
    return getTenantSeed(slug);
  }

  const raw = window.localStorage.getItem(getStorageKey(slug));
  if (!raw) {
    const seed = getTenantSeed(slug);
    persistTenantState(slug, seed);
    return seed;
  }

  try {
    return JSON.parse(raw) as TenantState;
  } catch {
    const seed = getTenantSeed(slug);
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

export const getQueueNumber = (state: TenantState): string => {
  const latest = state.queues
    .map((item) => Number(item.queueCode.replace(/^A-/, '')))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => b - a)[0];

  const next = (latest || 0) + 1;
  return `A-${next.toString().padStart(3, '0')}`;
};

export const countQueueAhead = (
  queues: QueueTicket[],
  currentQueueId: string,
): number => {
  const activeQueues = queues
    .filter((item) => isActiveQueueStatus(item.status))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const currentIndex = activeQueues.findIndex((item) => item.id === currentQueueId);
  if (currentIndex <= 0) {
    return 0;
  }

  return currentIndex;
};

const ALLOWED_TRANSITIONS: Record<QueueStatus, QueueStatus[]> = {
  WAITING: ['CALLED', 'CANCELED'],
  CALLED: ['SERVING', 'NO_SHOW', 'CANCELED'],
  SERVING: ['DONE'],
  DONE: [],
  NO_SHOW: [],
  CANCELED: [],
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
    source: 'ONLINE' | 'OFFLINE';
  },
): TenantState => {
  const queue: QueueTicket = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    queueCode: getQueueNumber(state),
    customerName: payload.customerName,
    customerWhatsapp: payload.customerWhatsapp,
    barberId: payload.barberId,
    serviceId: payload.serviceId,
    source: payload.source,
    status: 'WAITING',
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    updatedAt: new Date().toISOString(),
    queues: [...state.queues, queue],
  };
};
