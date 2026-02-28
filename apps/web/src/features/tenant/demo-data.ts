import type { TenantState } from './types';

const now = new Date();
const today = now.toISOString().slice(0, 10);

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
      description:
        'Barbershop modern dengan fokus haircut presisi, styling rapi, dan pengalaman pelanggan yang nyaman.',
      coverImageUrl:
        'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1400&q=80',
      logoImageUrl:
        'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=300&q=80',
      mapsUrl: 'https://maps.google.com/?q=Jl.+Merdeka+No.+18,+Bandung',
      instagram: '@barberjaya.id',
      tiktok: '@barberjaya.id',
      facebook: 'barberjaya.id',
      subscriptionStatus: 'ACTIVE',
    },
    barbers: [
      {
        id: 'barber-andi',
        name: 'Andi',
        username: 'andi.fade',
        email: 'andi@barberjaya.local',
        phone: '628111111111',
        socialMedia: '@andi.fade',
        instagram: '@andi.fade',
        tiktok: '@andi.fade',
        description: 'Spesialis fade, taper, dan crop modern.',
        photoUrl:
          'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        id: 'barber-raka',
        name: 'Raka',
        username: 'raka.classic',
        email: 'raka@barberjaya.local',
        phone: '628222222222',
        socialMedia: '@raka.classic',
        instagram: '@raka.classic',
        tiktok: '@raka.classic',
        description: 'Spesialis classic cut, pompadour, dan beard trim.',
        photoUrl:
          'https://images.unsplash.com/photo-1596728325488-58c87691e9af?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
    ],
    services: [
      {
        id: 'svc-haircut',
        name: 'Haircut Signature',
        durationMinutes: 30,
        price: 50000,
        description: 'Potong rambut signature dengan konsultasi gaya.',
        isActive: true,
      },
      {
        id: 'svc-haircut-beard',
        name: 'Haircut + Beard Trim',
        durationMinutes: 45,
        price: 75000,
        description: 'Potong rambut + perapihan jenggot.',
        isActive: true,
      },
      {
        id: 'svc-coloring',
        name: 'Hair Coloring',
        durationMinutes: 90,
        price: 170000,
        description: 'Pewarnaan rambut dengan produk profesional.',
        isActive: true,
      },
    ],
    closedSlots: [],
    queues: [
      {
        id: 'booking-001',
        bookingCode: 'BK-0101',
        customerName: 'Budi',
        customerWhatsapp: '6281212121212',
        barberId: 'barber-andi',
        serviceId: 'svc-haircut',
        bookingDate: today,
        slotTime: '10:00',
        source: 'ONLINE',
        status: 'IN_SERVICE',
        createdAt: minutesAgo(45),
      },
      {
        id: 'booking-002',
        bookingCode: 'BK-0102',
        customerName: 'Rizky',
        customerWhatsapp: '6289898989898',
        barberId: 'barber-raka',
        serviceId: 'svc-haircut-beard',
        bookingDate: today,
        slotTime: '10:30',
        source: 'OFFLINE',
        status: 'CHECKED_IN',
        createdAt: minutesAgo(30),
      },
      {
        id: 'booking-003',
        bookingCode: 'BK-0103',
        customerName: 'Dimas',
        customerWhatsapp: '6287878787878',
        barberId: 'barber-andi',
        serviceId: 'svc-haircut',
        bookingDate: today,
        slotTime: '11:00',
        source: 'ONLINE',
        status: 'BOOKED',
        createdAt: minutesAgo(20),
      },
      {
        id: 'booking-004',
        bookingCode: 'BK-0104',
        customerName: 'Rina',
        customerWhatsapp: '6281313131313',
        barberId: 'barber-raka',
        serviceId: 'svc-coloring',
        bookingDate: today,
        slotTime: '11:30',
        source: 'ONLINE',
        status: 'BOOKED',
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
    description: 'Profil usaha belum diperbarui.',
    coverImageUrl: '',
    logoImageUrl: '',
    mapsUrl: '',
    instagram: '',
    tiktok: '',
    facebook: '',
    subscriptionStatus: 'ACTIVE',
  },
  barbers: [
    {
      id: `barber-${slug}-1`,
      name: 'Worker Utama',
      username: 'worker.utama',
      email: `worker@${slug}.local`,
      phone: '6280000000001',
      socialMedia: '@worker',
      instagram: '@worker',
      tiktok: '',
      description: 'Spesialis basic haircut.',
      photoUrl:
        'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=400&q=80',
      isActive: true,
    },
  ],
  services: [
    {
      id: `svc-${slug}-1`,
      name: 'Haircut',
      durationMinutes: 30,
      price: 40000,
      description: 'Layanan potong rambut standar.',
      isActive: true,
    },
  ],
  closedSlots: [],
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
