"use client";

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogOut,
  MessageCircle,
  PencilLine,
  PlayCircle,
  Scissors,
  ShieldCheck,
  UserCheck2,
  UserRound,
  UserX,
  XCircle,
} from 'lucide-react';
import { getAllowedTransitions } from '@/features/tenant/store';
import {
  QUEUE_STATUS_BADGE,
  QUEUE_STATUS_HELP,
  QUEUE_STATUS_LABEL,
  type BarberProfile,
  type ClosedSlot,
  type QueueTicket,
  type QueueStatus,
  type ServiceItem,
  type TenantState,
} from '@/features/tenant/types';

type PanelRole = 'ADMIN_BARBER' | 'WORKER';
type AdminTab = 'bookings' | 'workers' | 'services' | 'schedule' | 'branding';
type AuthStage = 'PICK_ROLE' | 'LOGIN_FORM';

type PanelSession = {
  role: PanelRole;
  workerId: string | null;
  actorName: string;
  actorEmail: string;
  actorUsername: string;
  dbRole?: string;
  accessToken?: string; // Optional for backward compatibility but unused in fetch
  refreshToken?: string;
  loggedAt: string;
};

type BrandingForm = {
  name: string;
  city: string;
  address: string;
  whatsapp: string;
  operationalHours: string;
  description: string;
  coverImageUrl: string;
  logoImageUrl: string;
  mapsUrl: string;
  instagram: string;
  tiktok: string;
  facebook: string;
};

const SLOT_OPTIONS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
] as const;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
const sessionKey = (slug: string): string => `malas-ngantri:panel-session:${slug}`;

const loadPanelSession = (slug?: string): PanelSession | null => {
  if (!slug || typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = localStorage.getItem(sessionKey(slug));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PanelSession;
    return parsed;
  } catch {
    localStorage.removeItem(sessionKey(slug));
    return null;
  }
};

const toBrandingForm = (tenant: TenantState['tenant']): BrandingForm => {
  return {
    name: tenant.name,
    city: tenant.city,
    address: tenant.address,
    whatsapp: tenant.whatsapp,
    operationalHours: tenant.operationalHours,
    description: tenant.description ?? '',
    coverImageUrl: tenant.coverImageUrl ?? '',
    logoImageUrl: tenant.logoImageUrl ?? '',
    mapsUrl: tenant.mapsUrl ?? '',
    instagram: tenant.instagram ?? '',
    tiktok: tenant.tiktok ?? '',
    facebook: tenant.facebook ?? '',
  };
};

const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
};

const toWaLink = (phone: string, message: string): string => {
  const normalized = phone.replace(/\D/g, '');
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};

const normalizePhone = (value: string | null | undefined): string => (value || '').replace(/[^\d+]/g, '');

const toTimeSlot = (value: string | null | undefined): string => {
  if (!value) return '00:00';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '00:00';
  return date.toISOString().slice(11, 16);
};

const parseOperationalHours = (value?: string | null): { openingTime?: string; closingTime?: string } => {
  if (!value) {
    return {};
  }

  const match = value.trim().match(/^([01]\d|2[0-3]):([0-5]\d)\s*-\s*([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    return {};
  }

  return {
    openingTime: `${match[1]}:${match[2]}`,
    closingTime: `${match[3]}:${match[4]}`,
  };
};

const isQueueStatus = (value: string): value is QueueStatus => {
  return ['BOOKED', 'CHECKED_IN', 'IN_SERVICE', 'DONE', 'CANCELED', 'NO_SHOW'].includes(value);
};

const mapTenantFromBackend = (
  payload: any,
  slug: string,
  previousTenant?: TenantState['tenant'],
): TenantState['tenant'] => {
  const openingTime = payload?.openingTime || '09:00';
  const closingTime = payload?.closingTime || '18:00';
  const operationalHours = payload?.operationalHours || `${openingTime} - ${closingTime}`;

  return {
    id: payload?.id || previousTenant?.id || `tenant-${slug}`,
    slug,
    name: payload?.name || previousTenant?.name || slug,
    city: payload?.city || previousTenant?.city || '',
    address: payload?.address || previousTenant?.address || '',
    whatsapp: payload?.whatsapp || payload?.phoneNumber || previousTenant?.whatsapp || '',
    operationalHours,
    description: payload?.description || previousTenant?.description || '',
    coverImageUrl: payload?.coverImageUrl || previousTenant?.coverImageUrl || '',
    logoImageUrl: payload?.logoImageUrl || payload?.logoUrl || previousTenant?.logoImageUrl || '',
    mapsUrl: payload?.mapsUrl || previousTenant?.mapsUrl || '',
    instagram: payload?.instagram || payload?.socialLinks?.instagram || previousTenant?.instagram || '',
    tiktok: payload?.tiktok || payload?.socialLinks?.tiktok || previousTenant?.tiktok || '',
    facebook: payload?.facebook || payload?.socialLinks?.facebook || previousTenant?.facebook || '',
    subscriptionStatus: payload?.subscriptionStatus || previousTenant?.subscriptionStatus || 'ACTIVE',
  };
};

const mapWorkerFromAdmin = (worker: any): BarberProfile => ({
  id: worker.id,
  name: worker.name,
  username: worker.username || '',
  email: worker.email || '',
  phone: worker.phone || '-',
  socialMedia: worker?.socials?.instagram || worker?.socials?.tiktok || '-',
  photoUrl:
    worker.photoUrl ||
    'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=400&q=80',
  instagram: worker?.socials?.instagram || '',
  tiktok: worker?.socials?.tiktok || '',
  description: worker.bio || '',
  isActive: worker.isActive ?? true,
});

const mapWorkerFromPublic = (worker: any): BarberProfile => ({
  id: worker.id,
  name: worker.name,
  username: '',
  email: '',
  phone: worker.phone || '-',
  socialMedia: worker?.socialLinks?.instagram || worker?.socialLinks?.tiktok || '-',
  photoUrl:
    worker.photoUrl ||
    'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=400&q=80',
  instagram: worker?.socialLinks?.instagram || '',
  tiktok: worker?.socialLinks?.tiktok || '',
  description: worker.bio || '',
  isActive: worker.isActive ?? true,
});

const mapServiceFromBackend = (service: any): ServiceItem => ({
  id: service.id,
  name: service.name,
  durationMinutes: Number(service.duration || 0),
  price: Number(service.price || 0),
  description: service.description || '',
  isActive: service.isActive ?? true,
});

const mapQueueFromBackend = (queue: any): QueueTicket => {
  const slotTime = queue.scheduledTime || toTimeSlot(queue.estimatedStart || queue.createdAt);
  const status = isQueueStatus(queue.status) ? queue.status : 'BOOKED';

  return {
    id: queue.id,
    bookingCode: queue.queueNumber || queue.id,
    customerName: queue.customerName || queue.customer?.fullName || '-',
    customerWhatsapp: normalizePhone(queue.customerPhone || queue.customer?.phoneNumber) || '-',
    barberId: queue.barberId,
    serviceId: queue.serviceId,
    bookingDate: queue.scheduledDate ? new Date(queue.scheduledDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    slotTime,
    source: queue.bookingType === 'WALK_IN' ? 'OFFLINE' : 'ONLINE',
    status,
    createdAt: queue.createdAt || new Date().toISOString(),
  };
};

const mapClosedSlotFromBackend = (slot: any): ClosedSlot => ({
  id: slot.id,
  bookingDate: slot.date ? new Date(slot.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
  slotTime: slot.startTime || '00:00',
  barberId: slot.barberId || null,
  note: slot.note || '',
});

const PRIMARY_ACTION_LABEL: Partial<Record<QueueStatus, string>> = {
  BOOKED: 'Tandai Sudah Datang',
  CHECKED_IN: 'Mulai Layanan',
  IN_SERVICE: 'Selesaikan',
};

const PRIMARY_NEXT_STATUS: Partial<Record<QueueStatus, QueueStatus>> = {
  BOOKED: 'CHECKED_IN',
  CHECKED_IN: 'IN_SERVICE',
  IN_SERVICE: 'DONE',
};

export default function TenantAdminQueuePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [tenantState, setTenantState] = useState<TenantState | null>(null);
  const [tenantLoading, setTenantLoading] = useState(true);

  const [authStage, setAuthStage] = useState<AuthStage>('PICK_ROLE');
  const [selectedRole, setSelectedRole] = useState<PanelRole>(() => {
    return loadPanelSession(slug)?.role ?? 'ADMIN_BARBER';
  });
  const [panelSession, setPanelSession] = useState<PanelSession | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authIdentifier, setAuthIdentifier] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [barberId, setBarberId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slotTime, setSlotTime] = useState<(typeof SLOT_OPTIONS)[number]>('10:00');
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');
  const [workerTab, setWorkerTab] = useState<'bookings' | 'profile'>('bookings');

  const [workerForm, setWorkerForm] = useState({
    id: '',
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    instagram: '',
    tiktok: '',
    description: '',
    photoUrl: '',
    isActive: true,
  });
  const [serviceForm, setServiceForm] = useState({
    id: '',
    name: '',
    durationMinutes: 30,
    price: 45000,
    description: '',
  });
  const [brandingForm, setBrandingForm] = useState<BrandingForm | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    bookingDate: new Date().toISOString().slice(0, 10),
    slotTime: '10:00',
    barberId: '',
    note: '',
  });

  const [notice, setNotice] = useState('');
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const getAuthHeaders = (session?: PanelSession | null): HeadersInit => {
    void session;
    return {};
  };

  const fetchPublicWorkers = async (barbershopId: string): Promise<BarberProfile[]> => {
    const response = await fetch(`${API_BASE_URL}/barbershops/${barbershopId}/barbers`, {
      credentials: 'include',
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.error?.message || payload?.message || 'Gagal memuat daftar worker publik.');
    }
    const workers = Array.isArray(payload?.data) ? payload.data : [];
    return workers.map(mapWorkerFromPublic);
  };

  const fetchServicesFromBackend = async (barbershopId: string): Promise<ServiceItem[]> => {
    const response = await fetch(`${API_BASE_URL}/barbershops/${barbershopId}/services`, {
      credentials: 'include',
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.error?.message || payload?.message || 'Gagal memuat daftar layanan.');
    }
    const services = Array.isArray(payload?.data) ? payload.data : [];
    return services.map(mapServiceFromBackend);
  };

  const fetchClosedSlotsFromBackend = async (session: PanelSession): Promise<ClosedSlot[]> => {
    if (session.role !== 'ADMIN_BARBER') {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/schedules/unavailable`, {
      credentials: 'include',
      headers: getAuthHeaders(session),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.error?.message || payload?.message || 'Gagal memuat slot tutup dari server.');
    }

    const slots = Array.isArray(payload?.data) ? payload.data : [];
    return slots
      .map(mapClosedSlotFromBackend)
      .sort((a: ClosedSlot, b: ClosedSlot) => `${a.bookingDate} ${a.slotTime}`.localeCompare(`${b.bookingDate} ${b.slotTime}`));
  };

  const fetchWorkersFromBackend = async (session: PanelSession): Promise<BarberProfile[]> => {
    if (!slug) {
      return [];
    }
    const response = await fetch(`/api/${slug}/workers`, {
      credentials: 'include',
      headers: getAuthHeaders(session),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.error?.message || payload?.message || 'Gagal memuat worker tenant.');
    }
    const workers = Array.isArray(payload?.data) ? payload.data : [];
    return workers.map(mapWorkerFromAdmin);
  };

  const fetchWorkerSelfFromBackend = async (session: PanelSession): Promise<BarberProfile | null> => {
    const response = await fetch(`${API_BASE_URL}/barbers/me`, {
      credentials: 'include',
      headers: getAuthHeaders(session),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.error?.message || payload?.message || 'Gagal memuat profil worker.');
    }

    const barber = payload?.data?.barber;
    if (!barber) {
      return null;
    }

    return {
      id: barber.id,
      name: barber.name,
      username: '',
      email: barber.email || '',
      phone: barber.phone || '-',
      socialMedia: barber?.socialLinks?.instagram || barber?.socialLinks?.tiktok || '-',
      photoUrl:
        barber.photoUrl ||
        'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=400&q=80',
      instagram: barber?.socialLinks?.instagram || '',
      tiktok: barber?.socialLinks?.tiktok || '',
      description: barber.bio || '',
      isActive: barber.isActive ?? true,
    };
  };

  const fetchQueuesFromBackend = async (
    session: PanelSession,
    barbershopId: string,
  ): Promise<QueueTicket[]> => {
    let endpoint = `${API_BASE_URL}/barbershops/${barbershopId}/queues?date=${today}`;
    if (session.role === 'WORKER') {
      if (!session.workerId) {
        throw new Error('Profil worker tidak ditemukan untuk memuat booking.');
      }
      endpoint = `${API_BASE_URL}/barbers/${session.workerId}/queues?date=${today}`;
    }

    const response = await fetch(endpoint, {
      credentials: 'include',
      headers: getAuthHeaders(session),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.error?.message || payload?.message || 'Gagal memuat daftar booking.');
    }

    const rows =
      session.role === 'WORKER'
        ? (Array.isArray(payload?.data?.queues) ? payload.data.queues : [])
        : (Array.isArray(payload?.data) ? payload.data : []);

    const mappedRows: QueueTicket[] = rows.map((row: any) => mapQueueFromBackend(row));
    return mappedRows.sort((a, b) => `${a.bookingDate} ${a.slotTime}`.localeCompare(`${b.bookingDate} ${b.slotTime}`));
  };

  const fetchTenantSnapshot = async (sessionOverride?: PanelSession | null) => {
    if (!slug) {
      return;
    }

    const activeSession = sessionOverride ?? panelSession;
    const response = await fetch(`${API_BASE_URL}/barbershops/slug/${slug}`, {
      credentials: 'include',
      headers: getAuthHeaders(activeSession),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.error?.message || payload?.message || 'Tenant tidak ditemukan.');
    }

    const shop = payload?.data;
    if (!shop?.id) {
      throw new Error('Payload tenant tidak valid.');
    }

    const [publicWorkers, services] = await Promise.all([
      fetchPublicWorkers(shop.id),
      fetchServicesFromBackend(shop.id),
    ]);

    let workerProfiles = publicWorkers;
    if (activeSession?.role === 'ADMIN_BARBER') {
      workerProfiles = await fetchWorkersFromBackend(activeSession);
    } else if (activeSession?.role === 'WORKER') {
      const self = await fetchWorkerSelfFromBackend(activeSession);
      if (self) {
        const mapById = new Map(publicWorkers.map((worker) => [worker.id, worker]));
        mapById.set(self.id, { ...(mapById.get(self.id) || self), ...self });
        workerProfiles = Array.from(mapById.values());
      }
    }

    let queues: QueueTicket[] = [];
    if (activeSession) {
      queues = await fetchQueuesFromBackend(activeSession, shop.id);
    }

    let closedSlots: ClosedSlot[] = [];
    if (activeSession) {
      closedSlots = await fetchClosedSlotsFromBackend(activeSession);
    }

    setTenantState((prev) => ({
      tenant: mapTenantFromBackend(shop, slug, prev?.tenant),
      barbers: workerProfiles,
      services,
      closedSlots,
      queues,
      updatedAt: new Date().toISOString(),
    }));
    setBrandingForm(null);
  };

  const syncServicesFromBackend = async () => {
    if (!tenantState?.tenant.id) {
      return;
    }
    const services = await fetchServicesFromBackend(tenantState.tenant.id);
    setTenantState((prev) => (prev
      ? {
        ...prev,
        services,
        updatedAt: new Date().toISOString(),
      }
      : prev));
  };

  const syncWorkersFromBackend = async () => {
    if (!tenantState || !panelSession) {
      return;
    }

    if (panelSession.role === 'ADMIN_BARBER') {
      const workers = await fetchWorkersFromBackend(panelSession);
      setTenantState((prev) => (prev
        ? {
          ...prev,
          barbers: workers,
          updatedAt: new Date().toISOString(),
        }
        : prev));
      return;
    }

    const self = await fetchWorkerSelfFromBackend(panelSession);
    if (!self) {
      return;
    }

    setTenantState((prev) => {
      if (!prev) {
        return prev;
      }
      const mapById = new Map(prev.barbers.map((worker) => [worker.id, worker]));
      mapById.set(self.id, { ...(mapById.get(self.id) || self), ...self });
      return {
        ...prev,
        barbers: Array.from(mapById.values()),
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const syncQueuesFromBackend = async () => {
    if (!tenantState?.tenant.id || !panelSession) {
      return;
    }
    const queues = await fetchQueuesFromBackend(panelSession, tenantState.tenant.id);
    setTenantState((prev) => (prev
      ? {
        ...prev,
        queues,
        updatedAt: new Date().toISOString(),
      }
      : prev));
  };

  const syncClosedSlotsFromBackend = async () => {
    if (!panelSession || panelSession.role !== 'ADMIN_BARBER') {
      return;
    }
    const closedSlots = await fetchClosedSlotsFromBackend(panelSession);
    setTenantState((prev) => (prev
      ? {
        ...prev,
        closedSlots,
        updatedAt: new Date().toISOString(),
      }
      : prev));
  };

  useEffect(() => {
    if (!slug) {
      return;
    }

    let cancelled = false;

    const loadPublicSnapshot = async () => {
      try {
        setTenantLoading(true);
        await fetchTenantSnapshot(null);
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Gagal memuat tenant.';
          setNotice(message);
        }
      } finally {
        if (!cancelled) {
          setTenantLoading(false);
        }
      }
    };

    void loadPublicSnapshot();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      return;
    }

    let cancelled = false;

    const hydrateSession = async () => {
      const savedSession = loadPanelSession(slug);

      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.error?.message || 'Unauthorized');
        }

        const user = payload?.data?.user;
        if (!user) {
          throw new Error('Invalid session payload');
        }
        if (user?.barbershop?.slug && user.barbershop.slug !== slug) {
          throw new Error('Session tenant mismatch');
        }

        const normalizedRole = user.appRole || user.role;
        if (normalizedRole !== 'ADMIN_BARBER' && normalizedRole !== 'WORKER' && normalizedRole !== 'BARBER') {
          throw new Error('Role is not allowed for tenant admin panel');
        }

        const role: PanelRole =
          normalizedRole === 'WORKER' || normalizedRole === 'BARBER' ? 'WORKER' : 'ADMIN_BARBER';
        const nextSession: PanelSession = {
          role,
          workerId: role === 'WORKER' ? user.workerId || null : null,
          actorName: user.fullName || savedSession?.actorName || (role === 'WORKER' ? 'Worker' : 'Admin Barber'),
          actorEmail: user.email || savedSession?.actorEmail || '',
          actorUsername: user.username || savedSession?.actorUsername || '',
          dbRole: user.dbRole || savedSession?.dbRole,
          loggedAt: savedSession?.loggedAt || new Date().toISOString(),
        };

        if (!cancelled) {
          setPanelSession(nextSession);
          setSelectedRole(nextSession.role);
          setAuthStage('LOGIN_FORM');
          localStorage.setItem(sessionKey(slug), JSON.stringify(nextSession));
          await fetchTenantSnapshot(nextSession);
        }
      } catch {
        localStorage.removeItem(sessionKey(slug));
        if (!cancelled) {
          setPanelSession(null);
          setAuthStage('PICK_ROLE');
        }
      } finally {
        if (!cancelled) {
          setAuthChecking(false);
        }
      }
    };

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const isAdmin = panelSession?.role === 'ADMIN_BARBER';
  const workerScopeId = panelSession?.role === 'WORKER' ? panelSession.workerId : null;
  const effectiveTab: AdminTab = isAdmin ? activeTab : 'bookings';
  const showWorkerBookings = isAdmin || workerTab === 'bookings';
  const showWorkerProfile = !isAdmin && workerTab === 'profile';

  const queueRows = useMemo(() => {
    if (!tenantState) {
      return [];
    }

    return [...tenantState.queues].sort((a, b) => {
      const dateCompare = a.bookingDate.localeCompare(b.bookingDate);
      if (dateCompare !== 0) {
        return dateCompare;
      }
      return a.slotTime.localeCompare(b.slotTime);
    });
  }, [tenantState]);

  const todayBookings = useMemo(() => {
    return queueRows.filter((item) => {
      if (item.bookingDate !== today) {
        return false;
      }

      if (workerScopeId) {
        return item.barberId === workerScopeId;
      }

      return true;
    });
  }, [queueRows, today, workerScopeId]);

  const summary = useMemo(() => {
    return {
      booked: todayBookings.length,
      running: todayBookings.filter((item) => ['CHECKED_IN', 'IN_SERVICE'].includes(item.status)).length,
      done: todayBookings.filter((item) => item.status === 'DONE').length,
    };
  }, [todayBookings]);

  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const activeWorkers = useMemo(() => {
    return (tenantState?.barbers ?? []).filter((worker) => worker.isActive);
  }, [tenantState]);

  const activeServices = useMemo(() => {
    return (tenantState?.services ?? []).filter((service) => service.isActive);
  }, [tenantState]);

  const effectiveBarberId = workerScopeId
    ? workerScopeId
    : barberId && activeWorkers.some((item) => item.id === barberId)
      ? barberId
      : activeWorkers[0]?.id ?? '';
  const effectiveServiceId =
    serviceId && activeServices.some((item) => item.id === serviceId) ? serviceId : activeServices[0]?.id ?? '';
  const resolvedBrandingForm = tenantState ? brandingForm ?? toBrandingForm(tenantState.tenant) : null;
  const workerSelf = workerScopeId ? tenantState?.barbers.find((item) => item.id === workerScopeId) ?? null : null;
  const workerSelfDraft =
    workerScopeId && workerSelf && workerForm.id !== workerScopeId
      ? {
        id: workerSelf.id,
        name: workerSelf.name,
        username: workerSelf.username || '',
        email: workerSelf.email || '',
        password: '',
        phone: workerSelf.phone,
        instagram: workerSelf.instagram || '',
        tiktok: workerSelf.tiktok || '',
        description: workerSelf.description || '',
        photoUrl: workerSelf.photoUrl,
        isActive: workerSelf.isActive,
      }
      : workerForm;

  const handleAuthRolePick = (role: PanelRole) => {
    setSelectedRole(role);
    setAuthStage('LOGIN_FORM');
    setAuthIdentifier('');
    setAuthPassword('');
    setAuthError('');
  };

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!slug || !tenantState) {
      return;
    }

    if (!authIdentifier.trim()) {
      setAuthError('Email/username wajib diisi.');
      return;
    }

    if (authPassword.trim().length < 6) {
      setAuthError('Password minimal 6 karakter.');
      return;
    }

    setAuthError('');
    setAuthLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug: slug,
          loginAs: selectedRole === 'ADMIN_BARBER' ? 'ADMIN' : 'WORKER',
          identifier: authIdentifier.trim(),
          password: authPassword,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload?.success === false) {
        const message = payload?.error?.message || payload?.message || 'Login gagal.';
        throw new Error(message);
      }

      const meResponse = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      const mePayload = await meResponse.json().catch(() => ({}));
      if (!meResponse.ok || mePayload?.success === false) {
        throw new Error(mePayload?.error?.message || mePayload?.message || 'Sesi login tidak valid.');
      }
      const user = mePayload?.data?.user;
      if (!user) {
        throw new Error('Payload sesi login tidak valid.');
      }

      const normalizedRole = user.appRole || user.role;
      const mappedRole: PanelRole =
        normalizedRole === 'WORKER' || normalizedRole === 'BARBER' ? 'WORKER' : 'ADMIN_BARBER';

      if (user?.barbershop?.slug && user.barbershop.slug !== slug) {
        throw new Error('Akun ini bukan milik tenant yang sedang dibuka.');
      }
      if (mappedRole !== selectedRole) {
        throw new Error('Role login tidak sesuai pilihan.');
      }

      const resolvedWorkerId =
        mappedRole === 'WORKER'
          ? user.workerId ||
          tenantState.barbers.find(
            (item) =>
              item.username === (user.username || authIdentifier.trim()) ||
              item.email === (user.email || '') ||
              item.name.toLowerCase() === authIdentifier.trim().toLowerCase(),
          )?.id ||
          null
          : null;
      if (mappedRole === 'WORKER' && !resolvedWorkerId) {
        throw new Error('Akun worker tidak terhubung dengan profil worker tenant.');
      }

      const nextSession: PanelSession = {
        role: mappedRole,
        workerId: resolvedWorkerId,
        actorName: user.fullName || (mappedRole === 'WORKER' ? 'Worker' : 'Admin Barber'),
        actorEmail: user.email || '',
        actorUsername: user.username || authIdentifier.trim(),
        dbRole: user.dbRole,
        loggedAt: new Date().toISOString(),
      };

      setPanelSession(nextSession);
      localStorage.setItem(sessionKey(slug), JSON.stringify(nextSession));
      await fetchTenantSnapshot(nextSession);

      if (mappedRole === 'WORKER') {
        const selectedWorker = await fetchWorkerSelfFromBackend(nextSession);
        if (selectedWorker) {
          if (!nextSession.workerId) {
            nextSession.workerId = selectedWorker.id;
            setPanelSession({ ...nextSession });
            localStorage.setItem(sessionKey(slug), JSON.stringify(nextSession));
          }
          setWorkerForm({
            id: selectedWorker.id,
            name: selectedWorker.name,
            username: selectedWorker.username || '',
            email: selectedWorker.email || '',
            password: '',
            phone: selectedWorker.phone,
            instagram: selectedWorker.instagram || '',
            tiktok: selectedWorker.tiktok || '',
            description: selectedWorker.description || '',
            photoUrl: selectedWorker.photoUrl,
            isActive: selectedWorker.isActive,
          });
        }
        setNotice('Mode worker aktif. Fokus pada booking hari ini dan update status layanan.');
      } else {
        setNotice('Mode admin barber aktif. Anda bisa mengelola worker, layanan, jadwal, booking, dan branding.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login gagal.';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const logoutPanel = async () => {
    if (!slug) {
      return;
    }

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore network error on logout cleanup.
    }

    localStorage.removeItem(sessionKey(slug));
    setPanelSession(null);
    setAuthIdentifier('');
    setAuthPassword('');
    setAuthStage('PICK_ROLE');
  };

  const moveQueueStatus = async (queueId: string, nextStatus: QueueStatus) => {
    if (!panelSession) {
      setNotice('Session login tidak valid. Silakan login ulang.');
      return;
    }

    const transitionConfig: Record<
      QueueStatus,
      { method: 'PATCH' | 'DELETE'; path: string; body?: Record<string, unknown> } | null
    > = {
      BOOKED: null,
      CHECKED_IN: { method: 'PATCH', path: `/queues/${queueId}/check-in`, body: { status: 'CHECKED_IN' } },
      IN_SERVICE: { method: 'PATCH', path: `/queues/${queueId}/start`, body: { status: 'IN_SERVICE' } },
      DONE: { method: 'PATCH', path: `/queues/${queueId}/complete`, body: { status: 'DONE' } },
      NO_SHOW: { method: 'PATCH', path: `/queues/${queueId}/no-show`, body: { status: 'NO_SHOW' } },
      CANCELED: {
        method: 'DELETE',
        path: `/queues/${queueId}`,
        body: { cancelReason: 'Dibatalkan oleh admin', cancelToken: 'admin-panel' },
      },
    };

    const config = transitionConfig[nextStatus];
    if (!config) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${config.path}`, {
        method: config.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(panelSession),
        },
        ...(config.body ? { body: JSON.stringify(config.body) } : {}),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error?.message || payload?.message || 'Gagal memperbarui status booking.');
      }
      await syncQueuesFromBackend();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui status booking.';
      setNotice(message);
    }
  };

  const handlePrimaryAction = async (status: QueueStatus, queueId: string) => {
    const nextStatus = PRIMARY_NEXT_STATUS[status];
    if (!nextStatus) {
      return;
    }

    await moveQueueStatus(queueId, nextStatus);
  };

  const handleDangerAction = async (status: QueueStatus, queueId: string, customerName: string) => {
    const actionLabel = status === 'CANCELED' ? 'batalkan booking ini' : 'tandai pelanggan tidak hadir';
    const ok = window.confirm(`Yakin ingin ${actionLabel} untuk ${customerName}?`);
    if (!ok) {
      return;
    }

    await moveQueueStatus(queueId, status);
  };

  const addOfflineBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantState) {
      return;
    }

    const cleanWa = whatsapp.replace(/\D/g, '');

    if (!name.trim()) {
      setError('Nama pelanggan wajib diisi.');
      return;
    }
    if (cleanWa.length < 10) {
      setError('Nomor WhatsApp pelanggan tidak valid.');
      return;
    }
    if (!effectiveServiceId) {
      setError('Pilih layanan terlebih dahulu.');
      return;
    }

    const selectedWorkerId = workerScopeId || effectiveBarberId;
    if (!selectedWorkerId) {
      setError('Pilih worker terlebih dahulu.');
      return;
    }

    setError('');

    if (!panelSession || !tenantState.tenant.id) {
      setError('Session login tidak valid. Silakan login ulang.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/queues`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(panelSession),
        },
        body: JSON.stringify({
          barbershopId: tenantState.tenant.id,
          barberId: selectedWorkerId,
          serviceId: effectiveServiceId,
          customerName: name.trim(),
          customerPhone: cleanWa,
          bookingType: 'WALK_IN',
          scheduledDate: bookingDate,
          scheduledTime: slotTime,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) {
        const message = payload?.error?.message || payload?.message || 'Gagal menyimpan booking ke server.';
        setError(message);
        return;
      }
    } catch {
      setError('Gagal terhubung ke server. Periksa koneksi dan coba lagi.');
      return;
    }

    await syncQueuesFromBackend();
    setName('');
    setWhatsapp('');
    setNotice('Customer offline berhasil ditambahkan ke daftar booking.');
  };

  const resetWorkerForm = () => {
    setWorkerForm({
      id: '',
      name: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      instagram: '',
      tiktok: '',
      description: '',
      photoUrl: '',
      isActive: true,
    });
  };

  const saveWorker = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantState || !slug) {
      return;
    }
    if (!panelSession) {
      setNotice('Session login tidak valid. Silakan login ulang.');
      return;
    }

    if (!workerForm.name.trim()) {
      setNotice('Nama worker wajib diisi.');
      return;
    }

    if (!workerForm.email.trim() && !workerForm.username.trim()) {
      setNotice('Email atau username worker wajib diisi.');
      return;
    }

    if (!workerForm.id && workerForm.password.trim().length < 8) {
      setNotice('Password worker minimal 8 karakter.');
      return;
    }
    if (workerForm.id && workerForm.password.trim() && workerForm.password.trim().length < 8) {
      setNotice('Password worker minimal 8 karakter.');
      return;
    }

    try {
      const endpoint = workerForm.id ? `/api/${slug}/workers/${workerForm.id}` : `/api/${slug}/workers`;
      const method = workerForm.id ? 'PATCH' : 'POST';
      const response = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(panelSession),
        },
        body: JSON.stringify({
          name: workerForm.name.trim(),
          email: workerForm.email.trim() || undefined,
          username: workerForm.username.trim() || undefined,
          password: workerForm.password.trim() || undefined,
          phone: workerForm.phone.trim() || undefined,
          photoUrl: workerForm.photoUrl.trim() || undefined,
          socials: {
            instagram: workerForm.instagram.trim() || undefined,
            tiktok: workerForm.tiktok.trim() || undefined,
          },
          bio: workerForm.description.trim() || undefined,
          isActive: workerForm.isActive,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error?.message || payload?.message || 'Gagal menyimpan worker.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan worker.';
      setNotice(message);
      return;
    }

    await syncWorkersFromBackend();
    resetWorkerForm();
    setNotice(workerForm.id ? 'Data worker diperbarui.' : 'Worker baru ditambahkan.');
  };

  const editWorker = (worker: BarberProfile) => {
    setWorkerForm({
      id: worker.id,
      name: worker.name,
      username: worker.username || '',
      email: worker.email || '',
      password: '',
      phone: worker.phone,
      instagram: worker.instagram || '',
      tiktok: worker.tiktok || '',
      description: worker.description || '',
      photoUrl: worker.photoUrl,
      isActive: worker.isActive,
    });
  };

  const toggleWorker = async (workerId: string) => {
    if (!tenantState || !slug) {
      return;
    }
    if (!panelSession) {
      setNotice('Session login tidak valid. Silakan login ulang.');
      return;
    }

    const target = tenantState.barbers.find((item) => item.id === workerId);
    if (!target) {
      return;
    }
    const nextIsActive = !target.isActive;

    try {
      const response = await fetch(`/api/${slug}/workers/${workerId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(panelSession),
        },
        body: JSON.stringify({ isActive: nextIsActive }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error?.message || 'Gagal mengubah status worker.');
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal mengubah status worker.');
      return;
    }

    await syncWorkersFromBackend();
  };

  const removeWorker = async (workerId: string) => {
    if (!tenantState || !slug) {
      return;
    }
    if (!panelSession) {
      setNotice('Session login tidak valid. Silakan login ulang.');
      return;
    }

    const inUse = tenantState.queues.some((item) => item.barberId === workerId && ['BOOKED', 'CHECKED_IN', 'IN_SERVICE'].includes(item.status));
    if (inUse) {
      setNotice('Worker masih memiliki booking aktif. Selesaikan booking dulu sebelum hapus worker.');
      return;
    }

    const ok = window.confirm('Hapus worker ini?');
    if (!ok) {
      return;
    }

    try {
      const response = await fetch(`/api/${slug}/workers/${workerId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(panelSession),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error?.message || 'Gagal menghapus worker.');
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal menghapus worker.');
      return;
    }

    await syncWorkersFromBackend();
  };

  const resetServiceForm = () => {
    setServiceForm({
      id: '',
      name: '',
      durationMinutes: 30,
      price: 45000,
      description: '',
    });
  };

  const saveService = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantState) {
      return;
    }
    if (!panelSession) {
      setNotice('Session login tidak valid. Silakan login ulang.');
      return;
    }

    if (!serviceForm.name.trim()) {
      setNotice('Nama layanan wajib diisi.');
      return;
    }

    const isEdit = Boolean(serviceForm.id);
    const body = {
      name: serviceForm.name.trim(),
      duration: Number(serviceForm.durationMinutes), // backend field name is 'duration'
      price: Number(serviceForm.price),
      description: serviceForm.description.trim(),
    };

    try {
      const url = isEdit
        ? `${API_BASE_URL}/services/${serviceForm.id}`
        : `${API_BASE_URL}/services`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(panelSession),
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.success === false) {
        const message = result?.error?.message || result?.message || 'Gagal menyimpan layanan ke server.';
        setNotice(message);
        return;
      }
    } catch {
      setNotice('Gagal terhubung ke server. Periksa koneksi dan coba lagi.');
      return;
    }

    await syncServicesFromBackend();

    resetServiceForm();
    setNotice(isEdit ? 'Layanan diperbarui.' : 'Layanan baru ditambahkan.');
  };

  const editService = (service: ServiceItem) => {
    setServiceForm({
      id: service.id,
      name: service.name,
      durationMinutes: service.durationMinutes,
      price: service.price,
      description: service.description || '',
    });
  };

  const toggleService = async (serviceId: string) => {
    if (!tenantState) {
      return;
    }
    if (!panelSession) {
      setNotice('Session login tidak valid. Silakan login ulang.');
      return;
    }

    const current = tenantState.services.find((item) => item.id === serviceId);
    if (!current) return;
    const nextIsActive = !current.isActive;

    try {
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(panelSession),
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: nextIsActive }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.success === false) {
        setNotice(result?.error?.message || 'Gagal mengubah status layanan.');
        return;
      }
    } catch {
      setNotice('Gagal terhubung ke server.');
      return;
    }

    await syncServicesFromBackend();
  };

  const removeService = async (serviceId: string) => {
    if (!tenantState) {
      return;
    }
    if (!panelSession) {
      setNotice('Session login tidak valid. Silakan login ulang.');
      return;
    }

    const inUse = tenantState.queues.some(
      (item) => item.serviceId === serviceId && ['BOOKED', 'CHECKED_IN', 'IN_SERVICE'].includes(item.status),
    );
    if (inUse) {
      setNotice('Layanan masih dipakai booking aktif. Nonaktifkan dulu jika tidak ingin ditampilkan.');
      return;
    }

    const ok = window.confirm('Hapus layanan ini?');
    if (!ok) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(panelSession),
        credentials: 'include',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.success === false) {
        setNotice(result?.error?.message || 'Gagal menghapus layanan.');
        return;
      }
    } catch {
      setNotice('Gagal terhubung ke server.');
      return;
    }

    await syncServicesFromBackend();
  };

  const saveScheduleSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantState || !resolvedBrandingForm) {
      return;
    }
    if (!panelSession) {
      setNotice('Session login tidak valid. Silakan login ulang.');
      return;
    }

    const barbershopId = tenantState.tenant.id;
    const operationalHours = resolvedBrandingForm.operationalHours.trim();

    try {
      const response = await fetch(`${API_BASE_URL}/barbershops/${barbershopId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(panelSession),
        },
        credentials: 'include',
        body: JSON.stringify({ operationalHours }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.success === false) {
        const message = result?.error?.message || result?.message || 'Gagal menyimpan jam operasional ke server.';
        setNotice(message);
        return;
      }
    } catch {
      setNotice('Gagal terhubung ke server. Periksa koneksi dan coba lagi.');
      return;
    }

    await fetchTenantSnapshot(panelSession);
    setNotice('Jam operasional berhasil diperbarui.');
  };

  const addClosedSlot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantState || !panelSession) {
      return;
    }

    const body = {
      date: scheduleForm.bookingDate,
      startTime: scheduleForm.slotTime, // Simplification: we treat discrete slots as closures
      // endTime could be calculated from slotTime + duration, but discrete is fine for now
      barberId: scheduleForm.barberId || null,
      note: scheduleForm.note.trim(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/schedules/unavailable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(panelSession),
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.success === false) {
        setNotice(result?.error?.message || 'Gagal menutup slot di server.');
        return;
      }
    } catch {
      setNotice('Gagal terhubung ke server.');
      return;
    }

    await syncClosedSlotsFromBackend();
    setScheduleForm((prev) => ({ ...prev, note: '' }));
    setNotice('Slot berhasil ditutup.');
  };

  const removeClosedSlot = async (slotId: string) => {
    if (!tenantState || !panelSession) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/schedules/unavailable/${slotId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(panelSession),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.success === false) {
        setNotice(result?.error?.message || 'Gagal membuka slot di server.');
        return;
      }
    } catch {
      setNotice('Gagal terhubung ke server.');
      return;
    }

    await syncClosedSlotsFromBackend();
    setNotice('Slot berhasil dibuka kembali.');
  };

  const saveBranding = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantState || !resolvedBrandingForm) {
      return;
    }
    if (!panelSession) {
      setNotice('Session login tidak valid. Silakan login ulang.');
      return;
    }

    const barbershopId = tenantState.tenant.id;

    try {
      const { openingTime, closingTime } = parseOperationalHours(resolvedBrandingForm.operationalHours.trim());
      const response = await fetch(`${API_BASE_URL}/barbershops/${barbershopId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(panelSession),
        },
        credentials: 'include',
        body: JSON.stringify({
          name: resolvedBrandingForm.name.trim(),
          city: resolvedBrandingForm.city.trim() || undefined,
          address: resolvedBrandingForm.address.trim() || undefined,
          whatsapp: resolvedBrandingForm.whatsapp.trim() || undefined,
          operationalHours: resolvedBrandingForm.operationalHours.trim() || undefined,
          openingTime,
          closingTime,
          description: resolvedBrandingForm.description.trim() || undefined,
          coverImageUrl: resolvedBrandingForm.coverImageUrl.trim() || undefined,
          logoImageUrl: resolvedBrandingForm.logoImageUrl.trim() || undefined,
          mapsUrl: resolvedBrandingForm.mapsUrl.trim() || undefined,
          instagram: resolvedBrandingForm.instagram.trim() || undefined,
          tiktok: resolvedBrandingForm.tiktok.trim() || undefined,
          facebook: resolvedBrandingForm.facebook.trim() || undefined,
          socialLinks: {
            instagram: resolvedBrandingForm.instagram.trim() || null,
            tiktok: resolvedBrandingForm.tiktok.trim() || null,
            facebook: resolvedBrandingForm.facebook.trim() || null,
            whatsapp: resolvedBrandingForm.whatsapp.trim() || null,
          },
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.success === false) {
        const message = result?.error?.message || result?.message || 'Gagal menyimpan branding ke server.';
        setNotice(message);
        return;
      }
    } catch {
      setNotice('Gagal terhubung ke server. Periksa koneksi dan coba lagi.');
      return;
    }

    await fetchTenantSnapshot(panelSession);

    setNotice('Branding landing page berhasil diperbarui.');
  };

  const updateBrandingField = (field: keyof BrandingForm, value: string) => {
    if (!resolvedBrandingForm) {
      return;
    }

    setBrandingForm({
      ...resolvedBrandingForm,
      [field]: value,
    });
  };

  const saveWorkerSelfProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantState || !workerScopeId || !panelSession) {
      return;
    }

    const worker = tenantState.barbers.find((item) => item.id === workerScopeId);
    if (!worker) {
      setNotice('Profil worker tidak ditemukan.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/barbers/me`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(panelSession),
        },
        body: JSON.stringify({
          photoUrl: workerSelfDraft.photoUrl.trim() || undefined,
          bio: workerSelfDraft.description.trim() || undefined,
          socialLinks: {
            instagram: workerSelfDraft.instagram.trim() || null,
            tiktok: workerSelfDraft.tiktok.trim() || null,
          },
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) {
        const message = payload?.error?.message || payload?.message || 'Gagal menyimpan profil worker.';
        setNotice(message);
        return;
      }
    } catch {
      setNotice('Gagal terhubung ke server. Periksa koneksi dan coba lagi.');
      return;
    }

    await syncWorkersFromBackend();
    setNotice('Profil worker berhasil diperbarui dan tampil di halaman customer.');
  };

  if (!slug) {
    return <main className="min-h-screen bg-neutral-950" />;
  }

  if (tenantLoading || !tenantState) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-20 text-neutral-100 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <h1 className="text-2xl font-black sm:text-3xl">Memuat Data Tenant</h1>
          <p className="mt-2 text-sm text-neutral-300">Sedang mengambil data dashboard terbaru dari server.</p>
        </div>
      </main>
    );
  }

  if (tenantState.tenant.subscriptionStatus !== 'ACTIVE') {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-20 text-neutral-100 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/30 bg-red-500/10 p-6 sm:p-8">
          <h1 className="text-2xl font-black sm:text-3xl">Akses Dashboard Dibatasi</h1>
          <p className="mt-2 text-sm text-red-100/90">
            Masa langganan tenant tidak aktif. Silakan hubungi pemilik platform untuk aktivasi ulang.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-neutral-900"
          >
            Kembali ke Platform Utama
          </Link>
        </div>
      </main>
    );
  }

  if (authChecking) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-20 text-neutral-100 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <h1 className="text-2xl font-black sm:text-3xl">Memverifikasi Sesi</h1>
          <p className="mt-2 text-sm text-neutral-300">Sedang memeriksa token akses panel tenant.</p>
        </div>
      </main>
    );
  }

  if (!panelSession) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(251,146,60,0.16),transparent_35%),#07080e] px-4 py-8 text-neutral-100 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <header className="rounded-3xl border border-white/10 bg-black/45 p-5 backdrop-blur sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-200">Panel Internal</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">{tenantState.tenant.name}</h1>
            <p className="mt-2 text-sm text-neutral-300">Halaman ini khusus internal. Pilih peran terlebih dahulu.</p>
          </header>

          {authStage === 'PICK_ROLE' ? (
            <section className="rounded-3xl border border-white/10 bg-black/40 p-5 sm:p-7">
              <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-neutral-400">Masuk sebagai</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleAuthRolePick('ADMIN_BARBER')}
                  className="rounded-2xl border border-sky-300/40 bg-sky-400/10 p-5 text-left"
                >
                  <p className="text-lg font-black text-sky-200">Login Admin</p>
                  <p className="mt-2 text-sm text-neutral-300">Kelola worker, layanan, jadwal, booking, dan branding.</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleAuthRolePick('WORKER')}
                  className="rounded-2xl border border-amber-300/40 bg-amber-400/10 p-5 text-left"
                >
                  <p className="text-lg font-black text-amber-200">Login Worker</p>
                  <p className="mt-2 text-sm text-neutral-300">Fokus pada booking hari ini dan progres layanan customer.</p>
                </button>
              </div>
            </section>
          ) : (
            <section className="rounded-3xl border border-white/10 bg-black/40 p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold text-neutral-300">
                  Login sebagai {selectedRole === 'ADMIN_BARBER' ? 'Admin Barber' : 'Worker'}
                </p>
                <button
                  type="button"
                  onClick={() => setAuthStage('PICK_ROLE')}
                  className="rounded-xl border border-white/20 px-3 py-2 text-xs font-bold uppercase tracking-widest"
                >
                  Ganti Role
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="mt-5 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                    {selectedRole === 'ADMIN_BARBER' ? 'Username / Email Admin' : 'Username / Email Worker'}
                  </span>
                  <input
                    value={authIdentifier}
                    onChange={(event) => setAuthIdentifier(event.target.value)}
                    className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-sky-400"
                    placeholder={selectedRole === 'ADMIN_BARBER' ? 'admin@barber.com' : 'worker.username'}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Password</span>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-sky-400"
                    placeholder="Minimal 6 karakter"
                  />
                </label>

                {authError ? <p className="text-sm font-semibold text-rose-300">{authError}</p> : null}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-400 px-4 py-3 text-sm font-black uppercase tracking-widest text-sky-950"
                >
                  {authLoading ? 'Memproses...' : 'Masuk Dashboard'}
                </button>
              </form>
            </section>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(251,146,60,0.22),transparent_35%),#07080e] px-4 py-6 text-neutral-100 sm:px-6 sm:py-8">
      <div className="mx-auto grid w-full max-w-[1400px] gap-4 lg:grid-cols-[250px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-black/45 p-3 backdrop-blur">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">{isAdmin ? 'Admin Panel' : 'Worker Panel'}</p>
            <p className="mt-1 text-sm font-black">{panelSession.actorName}</p>
            <p className="mt-1 text-xs text-neutral-500">{tenantState.tenant.name}</p>
          </div>

          <nav className="mt-3 space-y-1">
            <button
              type="button"
              onClick={() => isAdmin ? setActiveTab('bookings') : setWorkerTab('bookings')}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ${isAdmin ? (activeTab === 'bookings' ? 'bg-sky-400 text-sky-950' : 'text-neutral-200 hover:bg-white/10') : (workerTab === 'bookings' ? 'bg-sky-400 text-sky-950' : 'text-neutral-200 hover:bg-white/10')}`}
            >
              <CalendarDays size={16} />
              Booking Hari Ini
            </button>

            {isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('workers')}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ${activeTab === 'workers' ? 'bg-sky-400 text-sky-950' : 'text-neutral-200 hover:bg-white/10'}`}
                >
                  <UserRound size={16} />
                  Worker
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ${activeTab === 'services' ? 'bg-sky-400 text-sky-950' : 'text-neutral-200 hover:bg-white/10'}`}
                >
                  <Scissors size={16} />
                  Layanan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('schedule')}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ${activeTab === 'schedule' ? 'bg-sky-400 text-sky-950' : 'text-neutral-200 hover:bg-white/10'}`}
                >
                  <Clock3 size={16} />
                  Jadwal
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('branding')}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ${activeTab === 'branding' ? 'bg-sky-400 text-sky-950' : 'text-neutral-200 hover:bg-white/10'}`}
                >
                  <PencilLine size={16} />
                  Branding
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setWorkerTab('profile')}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ${workerTab === 'profile' ? 'bg-sky-400 text-sky-950' : 'text-neutral-200 hover:bg-white/10'}`}
              >
                <UserCheck2 size={16} />
                Profil Saya
              </button>
            )}
          </nav>

          <button
            type="button"
            onClick={logoutPanel}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-rose-500/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-rose-50"
          >
            <LogOut size={14} className="mr-2" />
            Logout
          </button>
        </aside>

        <section className="space-y-6 sm:space-y-8">
          <header className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-200">Dashboard Operasional</p>
                <h1 className="mt-2 text-3xl font-black sm:text-4xl">{tenantState.tenant.name}</h1>
                <div className="mt-2 inline-flex items-center gap-2 text-sm text-neutral-300">
                  <CalendarDays size={16} />
                  <span>{todayFormatted}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {isAdmin ? (
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                        tenantState.tenant.subscriptionStatus === 'ACTIVE'
                          ? 'border-emerald-300/30 bg-emerald-500/15 text-emerald-200'
                          : tenantState.tenant.subscriptionStatus === 'EXPIRED'
                            ? 'border-yellow-300/30 bg-yellow-500/15 text-yellow-200'
                            : 'border-rose-300/30 bg-rose-500/15 text-rose-200'
                      }`}
                    >
                      Subscription: {tenantState.tenant.subscriptionStatus}
                    </span>
                  ) : null}
                  <span className="text-xs text-neutral-400">
                    Login: {panelSession.actorName} ({panelSession.role === 'ADMIN_BARBER' ? 'Admin Barber' : 'Worker'})
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <Link
                  href={`/${slug}`}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10 sm:w-auto"
                >
                  Halaman Customer
                </Link>
              </div>
            </div>
          </header>

        {notice ? (
          <section className="rounded-2xl border border-sky-300/25 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">{notice}</section>
        ) : null}

        <section className="grid gap-3 sm:gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-black/45 p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Booking Hari Ini</p>
            <div className="mt-2 flex items-center gap-2">
              <Clock3 className="text-violet-300" size={18} />
              <p className="text-3xl font-black text-violet-200">{summary.booked}</p>
            </div>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/45 p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Sedang Berjalan</p>
            <div className="mt-2 flex items-center gap-2">
              <PlayCircle className="text-sky-300" size={18} />
              <p className="text-3xl font-black text-sky-200">{summary.running}</p>
            </div>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/45 p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Selesai</p>
            <div className="mt-2 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-300" size={18} />
              <p className="text-3xl font-black text-emerald-200">{summary.done}</p>
            </div>
          </article>
        </section>

        {showWorkerBookings && effectiveTab === 'bookings' ? (
          <section className={`grid gap-6 ${isAdmin ? 'xl:grid-cols-[1.8fr_1fr]' : ''}`}>
            <div className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur sm:p-6">
              <h2 className="text-xl font-black">{isAdmin ? 'Daftar Booking Hari Ini' : 'Booking Hari Ini (Worker)'}</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Tombol aksi berjalan berurutan: BOOKED → CHECKED_IN → IN_SERVICE → DONE.
              </p>

              {todayBookings.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-neutral-950/60 p-5 text-sm text-neutral-300">
                  Belum ada booking hari ini.
                </div>
              ) : (
                <>
                  <div className="mt-5 space-y-3 md:hidden">
                    {todayBookings.map((item) => {
                      const service = tenantState.services.find((svc) => svc.id === item.serviceId);
                      const worker = tenantState.barbers.find((row) => row.id === item.barberId);
                      const primaryLabel = PRIMARY_ACTION_LABEL[item.status];
                      const allowed = getAllowedTransitions(item.status);
                      const waMessage = `Halo ${item.customerName}, booking Anda di ${tenantState.tenant.name} pukul ${item.slotTime}.`;

                      return (
                        <article key={item.id} className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-black text-sky-200">{item.slotTime}</p>
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${QUEUE_STATUS_BADGE[item.status]}`}
                            >
                              {QUEUE_STATUS_LABEL[item.status]}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-neutral-100">{item.customerName}</p>
                          <p className="mt-1 text-xs text-neutral-300">{service?.name ?? '-'}</p>
                          <p className="mt-1 text-xs text-neutral-400">Worker: {worker?.name ?? '-'}</p>

                          <div className="mt-3 grid gap-2">
                            {primaryLabel ? (
                              <button
                                type="button"
                                onClick={() => handlePrimaryAction(item.status, item.id)}
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-sky-400 px-4 py-2 text-sm font-black text-sky-950"
                              >
                                {primaryLabel}
                              </button>
                            ) : null}

                            <a
                              href={toWaLink(item.customerWhatsapp, waMessage)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/25 bg-white/5 px-4 py-2 text-sm font-bold"
                            >
                              <MessageCircle size={16} className="mr-2" />
                              Hubungi WhatsApp
                            </a>

                            {isAdmin ? (
                              <div className="flex gap-2">
                                {allowed.includes('CANCELED') ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDangerAction('CANCELED', item.id, item.customerName)}
                                    className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-200"
                                  >
                                    <XCircle size={14} className="mr-1" />
                                    Batalkan
                                  </button>
                                ) : null}
                                {allowed.includes('NO_SHOW') ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDangerAction('NO_SHOW', item.id, item.customerName)}
                                    className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-orange-400/30 bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-200"
                                  >
                                    <UserX size={14} className="mr-1" />
                                    Tidak Hadir
                                  </button>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="mt-5 hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[920px] text-left text-sm">
                      <thead className="text-xs uppercase tracking-widest text-neutral-400">
                        <tr>
                          <th className="py-3 pr-3">Jam</th>
                          <th className="py-3 pr-3">Nama</th>
                          <th className="py-3 pr-3">Layanan</th>
                          <th className="py-3 pr-3">Worker</th>
                          <th className="py-3 pr-3">Status</th>
                          <th className="py-3">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todayBookings.map((item) => {
                          const service = tenantState.services.find((svc) => svc.id === item.serviceId);
                          const worker = tenantState.barbers.find((row) => row.id === item.barberId);
                          const primaryLabel = PRIMARY_ACTION_LABEL[item.status];
                          const allowed = getAllowedTransitions(item.status);
                          const waMessage = `Halo ${item.customerName}, booking Anda di ${tenantState.tenant.name} pukul ${item.slotTime}.`;

                          return (
                            <tr key={item.id} className="border-t border-white/10 align-top">
                              <td className="py-3 pr-3 font-black text-sky-200">{item.slotTime}</td>
                              <td className="py-3 pr-3">{item.customerName}</td>
                              <td className="py-3 pr-3">{service?.name ?? '-'}</td>
                              <td className="py-3 pr-3">{worker?.name ?? '-'}</td>
                              <td className="py-3 pr-3">
                                <span
                                  className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-bold ${QUEUE_STATUS_BADGE[item.status]}`}
                                >
                                  {QUEUE_STATUS_LABEL[item.status]}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="grid gap-2">
                                  {primaryLabel ? (
                                    <button
                                      type="button"
                                      onClick={() => handlePrimaryAction(item.status, item.id)}
                                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-400 px-4 py-2 text-sm font-black text-sky-950"
                                    >
                                      {primaryLabel}
                                    </button>
                                  ) : null}

                                  <div className="flex flex-wrap gap-2">
                                    <a
                                      href={toWaLink(item.customerWhatsapp, waMessage)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/25 bg-white/5 px-3 py-2 text-xs font-bold"
                                    >
                                      <MessageCircle size={14} className="mr-1" />
                                      WhatsApp
                                    </a>

                                    {isAdmin && allowed.includes('CANCELED') ? (
                                      <button
                                        type="button"
                                        onClick={() => handleDangerAction('CANCELED', item.id, item.customerName)}
                                        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-200"
                                      >
                                        Batalkan
                                      </button>
                                    ) : null}

                                    {isAdmin && allowed.includes('NO_SHOW') ? (
                                      <button
                                        type="button"
                                        onClick={() => handleDangerAction('NO_SHOW', item.id, item.customerName)}
                                        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-orange-400/30 bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-200"
                                      >
                                        Tidak Hadir
                                      </button>
                                    ) : null}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <aside className="space-y-6">
              <form onSubmit={addOfflineBooking} className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur sm:p-6">
                <h3 className="text-lg font-black">Tambah Customer Offline (Walk-in)</h3>
                <p className="mt-2 text-sm text-neutral-400">Untuk customer datang langsung tanpa booking online.</p>

                <div className="mt-5 grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Nama Pelanggan</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-sky-400"
                      placeholder="Contoh: Budi"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">WhatsApp</span>
                    <input
                      value={whatsapp}
                      onChange={(event) => setWhatsapp(event.target.value)}
                      className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-sky-400"
                      placeholder="62812xxxx"
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Tanggal</span>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(event) => setBookingDate(event.target.value)}
                        className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-sky-400"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Jam</span>
                      <select
                        value={slotTime}
                        onChange={(event) => setSlotTime(event.target.value as (typeof SLOT_OPTIONS)[number])}
                        className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-sky-400"
                      >
                        {SLOT_OPTIONS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {!workerScopeId ? (
                    <label className="grid gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Worker</span>
                      <select
                        value={effectiveBarberId}
                        onChange={(event) => setBarberId(event.target.value)}
                        className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-sky-400"
                      >
                        {activeWorkers.map((worker) => (
                          <option key={worker.id} value={worker.id}>
                            {worker.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}

                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Layanan</span>
                    <select
                      value={effectiveServiceId}
                      onChange={(event) => setServiceId(event.target.value)}
                      className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-sky-400"
                    >
                      {activeServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {error ? <p className="mt-3 text-sm font-semibold text-rose-300">{error}</p> : null}

                <button
                  type="submit"
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-sky-400 px-4 py-3 text-sm font-black uppercase tracking-widest text-sky-950"
                >
                  Simpan Walk-in
                </button>
              </form>

              <div className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur sm:p-6">
                <h3 className="text-lg font-black">Panduan Status</h3>
                <div className="mt-3 space-y-2 text-sm text-neutral-300">
                  {Object.entries(QUEUE_STATUS_HELP).map(([key, value]) => (
                    <p key={key}>
                      <span className="font-bold text-neutral-100">
                        {QUEUE_STATUS_LABEL[key as keyof typeof QUEUE_STATUS_HELP]}:
                      </span>{' '}
                      {value}
                    </p>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        ) : null}

        {isAdmin && effectiveTab === 'workers' ? (
          <section className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
            <form onSubmit={saveWorker} className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur sm:p-6">
              <h2 className="text-xl font-black">{workerForm.id ? 'Edit Worker' : 'Tambah Worker'}</h2>
              <p className="mt-2 text-sm text-neutral-400">Kelola profil worker yang tampil di halaman customer.</p>

              <div className="mt-4 grid gap-3">
                <input
                  value={workerForm.name}
                  onChange={(event) => setWorkerForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  placeholder="Nama worker"
                />
                <input
                  value={workerForm.username}
                  onChange={(event) => setWorkerForm((prev) => ({ ...prev, username: event.target.value }))}
                  className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  placeholder="Username worker (unik per tenant)"
                />
                <input
                  type="email"
                  value={workerForm.email}
                  onChange={(event) => setWorkerForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  placeholder="Email worker"
                />
                <input
                  type="password"
                  value={workerForm.password}
                  onChange={(event) => setWorkerForm((prev) => ({ ...prev, password: event.target.value }))}
                  className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  placeholder={workerForm.id ? 'Kosongkan jika tidak ganti password' : 'Password worker (min 8)'}
                />
                <input
                  value={workerForm.phone}
                  onChange={(event) => setWorkerForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  placeholder="WhatsApp worker"
                />
                <input
                  value={workerForm.instagram}
                  onChange={(event) => setWorkerForm((prev) => ({ ...prev, instagram: event.target.value }))}
                  className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  placeholder="Instagram"
                />
                <input
                  value={workerForm.tiktok}
                  onChange={(event) => setWorkerForm((prev) => ({ ...prev, tiktok: event.target.value }))}
                  className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  placeholder="TikTok"
                />
                <input
                  value={workerForm.photoUrl}
                  onChange={(event) => setWorkerForm((prev) => ({ ...prev, photoUrl: event.target.value }))}
                  className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  placeholder="URL foto"
                />
                <textarea
                  value={workerForm.description}
                  onChange={(event) => setWorkerForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="min-h-24 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  placeholder="Deskripsi singkat / spesialisasi"
                />
                <label className="inline-flex items-center gap-2 text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={workerForm.isActive}
                    onChange={(event) => setWorkerForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                    className="h-4 w-4 rounded border-white/20 bg-neutral-900"
                  />
                  Worker aktif
                </label>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-sky-400 px-4 py-2 text-sm font-black uppercase tracking-widest text-sky-950"
                >
                  {workerForm.id ? 'Update Worker' : 'Tambah Worker'}
                </button>
                {workerForm.id ? (
                  <button
                    type="button"
                    onClick={resetWorkerForm}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-widest"
                  >
                    Batal
                  </button>
                ) : null}
              </div>
            </form>

            <div className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur sm:p-6">
              <h2 className="text-xl font-black">Daftar Worker</h2>
              <div className="mt-4 space-y-3">
                {tenantState.barbers.map((worker) => (
                  <article key={worker.id} className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black">{worker.name}</p>
                        <p className="text-xs text-neutral-400">{worker.username || '-'}</p>
                        <p className="text-xs text-neutral-400">{worker.email || '-'}</p>
                        <p className="text-xs text-neutral-400">{worker.phone}</p>
                        <p className="text-xs text-neutral-400">{worker.description || '-'}</p>
                      </div>
                      <span
                        className={`rounded-full border px-2 py-1 text-[11px] font-bold ${worker.isActive
                          ? 'border-emerald-300/30 bg-emerald-500/15 text-emerald-200'
                          : 'border-neutral-300/20 bg-neutral-500/10 text-neutral-300'
                          }`}
                      >
                        {worker.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => editWorker(worker)}
                        className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-bold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleWorker(worker.id)}
                        className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-bold"
                      >
                        {worker.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeWorker(worker.id)}
                        className="rounded-lg border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-200"
                      >
                        Hapus
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {isAdmin && effectiveTab === 'services' ? (
          <section className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
            <form onSubmit={saveService} className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur sm:p-6">
              <h2 className="text-xl font-black">{serviceForm.id ? 'Edit Layanan' : 'Tambah Layanan'}</h2>

              <div className="mt-4 grid gap-3">
                <input
                  value={serviceForm.name}
                  onChange={(event) => setServiceForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  placeholder="Nama layanan"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={serviceForm.durationMinutes}
                    onChange={(event) =>
                      setServiceForm((prev) => ({ ...prev, durationMinutes: Number(event.target.value) || 0 }))
                    }
                    className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                    placeholder="Durasi (menit)"
                  />
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(event) => setServiceForm((prev) => ({ ...prev, price: Number(event.target.value) || 0 }))}
                    className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                    placeholder="Harga"
                  />
                </div>
                <textarea
                  value={serviceForm.description}
                  onChange={(event) => setServiceForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="min-h-24 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  placeholder="Deskripsi layanan"
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-sky-400 px-4 py-2 text-sm font-black uppercase tracking-widest text-sky-950"
                >
                  {serviceForm.id ? 'Update Layanan' : 'Tambah Layanan'}
                </button>
                {serviceForm.id ? (
                  <button
                    type="button"
                    onClick={resetServiceForm}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-widest"
                  >
                    Batal
                  </button>
                ) : null}
              </div>
            </form>

            <div className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur sm:p-6">
              <h2 className="text-xl font-black">Daftar Layanan</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {tenantState.services.map((service) => (
                  <article key={service.id} className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4">
                    <p className="text-base font-black">{service.name}</p>
                    <p className="mt-1 text-xs text-neutral-400">{service.description || '-'}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-300">
                      <span className="rounded-full border border-white/15 px-2 py-1">{service.durationMinutes} menit</span>
                      <span className="rounded-full border border-white/15 px-2 py-1">{formatRupiah(service.price)}</span>
                      <span
                        className={`rounded-full border px-2 py-1 ${service.isActive
                          ? 'border-emerald-300/30 bg-emerald-500/10 text-emerald-200'
                          : 'border-neutral-300/20 bg-neutral-500/10 text-neutral-300'
                          }`}
                      >
                        {service.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => editService(service)}
                        className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-bold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleService(service.id)}
                        className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-bold"
                      >
                        {service.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeService(service.id)}
                        className="rounded-lg border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-200"
                      >
                        Hapus
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {isAdmin && effectiveTab === 'schedule' ? (
          <section className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
            <div className="space-y-6">
              <form onSubmit={saveScheduleSettings} className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur sm:p-6">
                <h2 className="text-xl font-black">Jam Operasional</h2>
                <p className="mt-2 text-sm text-neutral-400">Contoh format: 09:00 - 21:00</p>
                <input
                  value={resolvedBrandingForm?.operationalHours || ''}
                  onChange={(event) => updateBrandingField('operationalHours', event.target.value)}
                  className="mt-4 min-h-11 w-full rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  placeholder="09:00 - 21:00"
                />
                <button
                  type="submit"
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-sky-400 px-4 py-2 text-sm font-black uppercase tracking-widest text-sky-950"
                >
                  Simpan Jam Operasional
                </button>
              </form>

              <form onSubmit={addClosedSlot} className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur sm:p-6">
                <h2 className="text-xl font-black">Tutup Slot / Libur</h2>
                <div className="mt-4 grid gap-3">
                  <input
                    type="date"
                    value={scheduleForm.bookingDate}
                    onChange={(event) => setScheduleForm((prev) => ({ ...prev, bookingDate: event.target.value }))}
                    className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  />
                  <select
                    value={scheduleForm.slotTime}
                    onChange={(event) => setScheduleForm((prev) => ({ ...prev, slotTime: event.target.value }))}
                    className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  >
                    {SLOT_OPTIONS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <select
                    value={scheduleForm.barberId}
                    onChange={(event) => setScheduleForm((prev) => ({ ...prev, barberId: event.target.value }))}
                    className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  >
                    <option value="">Semua worker</option>
                    {tenantState.barbers.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name}
                      </option>
                    ))}
                  </select>
                  <input
                    value={scheduleForm.note}
                    onChange={(event) => setScheduleForm((prev) => ({ ...prev, note: event.target.value }))}
                    className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                    placeholder="Catatan (opsional)"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-sky-400 px-4 py-2 text-sm font-black uppercase tracking-widest text-sky-950"
                >
                  Tutup Slot
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur sm:p-6">
              <h2 className="text-xl font-black">Daftar Slot Ditutup</h2>
              <div className="mt-4 space-y-3">
                {tenantState.closedSlots.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/20 bg-neutral-950/60 p-4 text-sm text-neutral-400">
                    Belum ada slot yang ditutup.
                  </div>
                ) : (
                  tenantState.closedSlots
                    .slice()
                    .sort((a, b) => `${a.bookingDate} ${a.slotTime}`.localeCompare(`${b.bookingDate} ${b.slotTime}`))
                    .map((slot) => {
                      const worker = tenantState.barbers.find((item) => item.id === slot.barberId);
                      return (
                        <article key={slot.id} className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4">
                          <p className="text-sm font-black text-sky-200">
                            {slot.bookingDate} • {slot.slotTime}
                          </p>
                          <p className="mt-1 text-xs text-neutral-300">Worker: {worker?.name || 'Semua worker'}</p>
                          <p className="mt-1 text-xs text-neutral-400">{slot.note || 'Tanpa catatan'}</p>
                          <button
                            type="button"
                            onClick={() => removeClosedSlot(slot.id)}
                            className="mt-3 rounded-lg border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-200"
                          >
                            Buka Slot
                          </button>
                        </article>
                      );
                    })
                )}
              </div>
            </div>
          </section>
        ) : null}

        {isAdmin && effectiveTab === 'branding' ? (
          <section className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur sm:p-6">
            <h2 className="text-xl font-black">Branding Landing Page</h2>
            <p className="mt-2 text-sm text-neutral-400">Data ini akan tampil di halaman customer `/{slug}`.</p>

            <form onSubmit={saveBranding} className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                value={resolvedBrandingForm?.name || ''}
                onChange={(event) => updateBrandingField('name', event.target.value)}
                className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                placeholder="Nama usaha"
              />
              <input
                value={resolvedBrandingForm?.city || ''}
                onChange={(event) => updateBrandingField('city', event.target.value)}
                className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                placeholder="Kota"
              />
              <input
                value={resolvedBrandingForm?.whatsapp || ''}
                onChange={(event) => updateBrandingField('whatsapp', event.target.value)}
                className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                placeholder="WhatsApp"
              />
              <input
                value={resolvedBrandingForm?.operationalHours || ''}
                onChange={(event) => updateBrandingField('operationalHours', event.target.value)}
                className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                placeholder="Jam operasional"
              />
              <input
                value={resolvedBrandingForm?.instagram || ''}
                onChange={(event) => updateBrandingField('instagram', event.target.value)}
                className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                placeholder="Instagram barber"
              />
              <input
                value={resolvedBrandingForm?.tiktok || ''}
                onChange={(event) => updateBrandingField('tiktok', event.target.value)}
                className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                placeholder="TikTok barber"
              />
              <input
                value={resolvedBrandingForm?.facebook || ''}
                onChange={(event) => updateBrandingField('facebook', event.target.value)}
                className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                placeholder="Facebook barber"
              />
              <input
                value={resolvedBrandingForm?.mapsUrl || ''}
                onChange={(event) => updateBrandingField('mapsUrl', event.target.value)}
                className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                placeholder="URL Maps"
              />
              <input
                value={resolvedBrandingForm?.logoImageUrl || ''}
                onChange={(event) => updateBrandingField('logoImageUrl', event.target.value)}
                className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm md:col-span-2"
                placeholder="URL logo"
              />
              <input
                value={resolvedBrandingForm?.coverImageUrl || ''}
                onChange={(event) => updateBrandingField('coverImageUrl', event.target.value)}
                className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm md:col-span-2"
                placeholder="URL cover image"
              />
              <input
                value={resolvedBrandingForm?.address || ''}
                onChange={(event) => updateBrandingField('address', event.target.value)}
                className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm md:col-span-2"
                placeholder="Alamat"
              />
              <textarea
                value={resolvedBrandingForm?.description || ''}
                onChange={(event) => updateBrandingField('description', event.target.value)}
                className="min-h-28 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm md:col-span-2"
                placeholder="Deskripsi usaha"
              />

              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-400 px-4 py-2 text-sm font-black uppercase tracking-widest text-sky-950 md:col-span-2"
              >
                Simpan Branding
              </button>
            </form>
          </section>
        ) : null}

        {showWorkerProfile ? (
          <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-4 text-sm text-neutral-300 sm:p-5">
              <div className="flex items-start gap-2">
                <UserCheck2 className="mt-0.5 text-sky-300" size={16} />
                <p>
                  Mode worker aktif. Fokus utama Anda: melihat booking hari ini, update status layanan, dan hubungi customer via WhatsApp.
                </p>
              </div>
            </div>

            <form onSubmit={saveWorkerSelfProfile} className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur sm:p-6">
              <h2 className="text-lg font-black">Edit Profil Worker</h2>
              <p className="mt-2 text-xs text-neutral-400">Profil ini tampil di halaman customer saat memilih worker.</p>
              <div className="mt-4 grid gap-3">
                <input
                  value={workerSelfDraft.photoUrl}
                  onChange={(event) => setWorkerForm({ ...workerSelfDraft, photoUrl: event.target.value })}
                  className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  placeholder="URL foto profil"
                />
                <input
                  value={workerSelfDraft.instagram}
                  onChange={(event) => setWorkerForm({ ...workerSelfDraft, instagram: event.target.value })}
                  className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  placeholder="Instagram"
                />
                <input
                  value={workerSelfDraft.tiktok}
                  onChange={(event) => setWorkerForm({ ...workerSelfDraft, tiktok: event.target.value })}
                  className="min-h-11 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  placeholder="TikTok"
                />
                <textarea
                  value={workerSelfDraft.description}
                  onChange={(event) => setWorkerForm({ ...workerSelfDraft, description: event.target.value })}
                  className="min-h-24 rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm"
                  placeholder="Deskripsi / spesialisasi"
                />
              </div>
              <button
                type="submit"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-sky-400 px-4 py-2 text-sm font-black uppercase tracking-widest text-sky-950"
              >
                Simpan Profil Worker
              </button>
            </form>
          </section>
        ) : null}

        <section className="rounded-3xl border border-white/10 bg-black/35 p-4 text-sm text-neutral-300 sm:p-5">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 text-sky-300" size={16} />
            <p>
              Halaman ini hanya untuk admin barber dan worker. Customer melakukan booking lewat halaman publik tenant.
            </p>
          </div>
        </section>
        </section>
      </div>
    </main>
  );
}
