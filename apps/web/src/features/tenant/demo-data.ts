import type { TenantState } from './types';

const now = new Date();

const minutesAgo = (minutes: number): string => {
  return new Date(now.getTime() - minutes * 60_000).toISOString();
};

const TENANT_SEEDS: Record<string, TenantState> = {
  'barber-jaya': {
    tenant: {
      id: 'tenant-barber-jaya',
      slug: 'barber-jaya',
      name: 'Barber Jaya',
      city: 'Bandung',
      address: 'Jl. Merdeka No. 18, Bandung',
      whatsapp: '6281234567890',
      operationalHours: '09:00 - 21:00',
      subscriptionStatus: 'ACTIVE',
    },
    barbers: [
      {
        id: 'barber-andi',
        name: 'Andi',
        phone: '628111111111',
        socialMedia: '@andi.fade',
        photoUrl:
          'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'barber-raka',
        name: 'Raka',
        phone: '628222222222',
        socialMedia: '@raka.classic',
        photoUrl:
          'https://images.unsplash.com/photo-1596728325488-58c87691e9af?auto=format&fit=crop&w=400&q=80',
      },
    ],
    services: [
      {
        id: 'svc-haircut',
        name: 'Haircut Signature',
        durationMinutes: 30,
        price: 50000,
      },
      {
        id: 'svc-haircut-beard',
        name: 'Haircut + Beard Trim',
        durationMinutes: 45,
        price: 75000,
      },
      {
        id: 'svc-coloring',
        name: 'Hair Coloring',
        durationMinutes: 90,
        price: 170000,
      },
    ],
    queues: [
      {
        id: 'queue-001',
        queueCode: 'A-021',
        customerName: 'Budi',
        customerWhatsapp: '6281212121212',
        barberId: 'barber-andi',
        serviceId: 'svc-haircut',
        source: 'ONLINE',
        status: 'SERVING',
        createdAt: minutesAgo(45),
      },
      {
        id: 'queue-002',
        queueCode: 'A-022',
        customerName: 'Rizky',
        customerWhatsapp: '6289898989898',
        barberId: 'barber-raka',
        serviceId: 'svc-haircut-beard',
        source: 'OFFLINE',
        status: 'CALLED',
        createdAt: minutesAgo(30),
      },
      {
        id: 'queue-003',
        queueCode: 'A-023',
        customerName: 'Dimas',
        customerWhatsapp: '6287878787878',
        barberId: 'barber-andi',
        serviceId: 'svc-haircut',
        source: 'ONLINE',
        status: 'WAITING',
        createdAt: minutesAgo(20),
      },
      {
        id: 'queue-004',
        queueCode: 'A-024',
        customerName: 'Rina',
        customerWhatsapp: '6281313131313',
        barberId: 'barber-raka',
        serviceId: 'svc-coloring',
        source: 'ONLINE',
        status: 'WAITING',
        createdAt: minutesAgo(12),
      },
    ],
    updatedAt: now.toISOString(),
  },
};

const buildFallbackSeed = (slug: string): TenantState => ({
  tenant: {
    id: `tenant-${slug}`,
    slug,
    name: slug
      .split('-')
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' '),
    city: 'Jakarta',
    address: 'Alamat belum diatur',
    whatsapp: '6280000000000',
    operationalHours: '09:00 - 21:00',
    subscriptionStatus: 'ACTIVE',
  },
  barbers: [
    {
      id: `barber-${slug}-1`,
      name: 'Barber Utama',
      phone: '6280000000001',
      socialMedia: '@barber',
      photoUrl:
        'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=400&q=80',
    },
  ],
  services: [
    {
      id: `svc-${slug}-1`,
      name: 'Haircut',
      durationMinutes: 30,
      price: 40000,
    },
  ],
  queues: [],
  updatedAt: now.toISOString(),
});

export const getTenantSeed = (slug: string): TenantState => {
  const selected = TENANT_SEEDS[slug];
  if (selected) {
    return JSON.parse(JSON.stringify(selected)) as TenantState;
  }

  return buildFallbackSeed(slug);
};
