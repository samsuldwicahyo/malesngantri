"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { io, type Socket } from 'socket.io-client';
import { CalendarDays, CheckCircle2, Clock3, MapPin, PhoneCall, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';

type Barbershop = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  activeQueues?: number;
  operationalHours?: string | null;
  coverImageUrl?: string | null;
  logoImageUrl?: string | null;
  mapsUrl?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
};

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string | null;
};

type Barber = {
  id: string;
  name: string;
  status: string;
  activeQueues: number;
  photoUrl?: string | null;
  bio?: string | null;
  specializations?: string[] | null;
  socialLinks?: { instagram?: string };
  services: Service[];
};

type QueueStatus = {
  id: string;
  status: string;
  queueNumber: string;
  scheduledDate?: string;
  scheduledTime?: string | null;
  cancelToken?: string;
  customerName?: string;
  customerPhone?: string;
  barber?: { id: string; name: string };
  service?: { id: string; name: string; duration: number };
};

type QueuePayload = {
  queue: QueueStatus;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
const SLOT_OPTIONS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
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

const toRupiah = (value: number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const normalizePhone = (value: string): string => value.replace(/[^\d+]/g, '');

export default function TenantLandingPage() {
  const params = useParams();
  const slug = String(params?.slug || '');
  const socketRef = useRef<Socket | null>(null);

  const [shop, setShop] = useState<Barbershop | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [slotError, setSlotError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slotTime, setSlotTime] = useState<(typeof SLOT_OPTIONS)[number]>('10:00');
  const [takenSlots, setTakenSlots] = useState<Set<string>>(new Set());
  const [isBooking, setIsBooking] = useState(false);
  const [queueData, setQueueData] = useState<QueuePayload | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('Batal booking');

  const storageKey = slug ? `booking:${slug}` : null;
  const normalizedPhone = normalizePhone(phone);

  const servicesCatalog = useMemo(() => {
    const serviceMap = new Map<string, Service>();
    for (const barber of barbers) {
      for (const service of barber.services || []) {
        serviceMap.set(service.id, service);
      }
    }
    return Array.from(serviceMap.values());
  }, [barbers]);

  const filteredWorkers = useMemo(() => {
    if (!selectedServiceId) return barbers;
    return barbers.filter((worker) => worker.services.some((service) => service.id === selectedServiceId));
  }, [barbers, selectedServiceId]);

  const selectedService = useMemo(
    () => servicesCatalog.find((service) => service.id === selectedServiceId) || null,
    [servicesCatalog, selectedServiceId],
  );
  const selectedWorker = useMemo(
    () => barbers.find((worker) => worker.id === selectedBarberId) || null,
    [barbers, selectedBarberId],
  );

  const bookingDateLabel = useMemo(() => {
    if (!bookingDate) return '-';
    const date = new Date(bookingDate);
    return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }, [bookingDate]);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const shopResponse = await fetch(`${API_BASE_URL}/barbershops/slug/${slug}`);
        const shopPayload = await shopResponse.json().catch(() => ({}));
        if (!shopResponse.ok || shopPayload?.success === false) {
          throw new Error(shopPayload?.error?.message || 'Tenant tidak ditemukan.');
        }

        const tenant = shopPayload.data as Barbershop;
        setShop(tenant);

        const workersResponse = await fetch(`${API_BASE_URL}/barbershops/${tenant.id}/barbers`);
        const workersPayload = await workersResponse.json().catch(() => ({}));
        if (!workersResponse.ok || workersPayload?.success === false) {
          throw new Error(workersPayload?.error?.message || 'Gagal memuat worker.');
        }
        setBarbers((workersPayload.data || []) as Barber[]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memuat tenant.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [slug]);

  useEffect(() => {
    if (!selectedServiceId) return;
    if (selectedBarberId && filteredWorkers.some((worker) => worker.id === selectedBarberId)) return;
    setSelectedBarberId(filteredWorkers[0]?.id || '');
  }, [filteredWorkers, selectedBarberId, selectedServiceId]);

  const fetchQueueStatus = useCallback(async (queueId: string, phoneValue: string, token?: string) => {
    try {
      const query = token ? `token=${encodeURIComponent(token)}` : `phone=${encodeURIComponent(phoneValue)}`;
      const response = await fetch(`${API_BASE_URL}/queues/public/${queueId}?${query}`);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) {
        if (response.status === 404 && storageKey) localStorage.removeItem(storageKey);
        setQueueData(null);
        return;
      }
      setQueueData(payload?.data || null);
    } catch {
      // ignore polling error
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as { queueId: string; phone: string; cancelToken?: string };
      if (!parsed.queueId) return;
      setPhone(parsed.phone || '');
      void fetchQueueStatus(parsed.queueId, parsed.phone || '', parsed.cancelToken);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [fetchQueueStatus, storageKey]);

  useEffect(() => {
    if (!queueData?.queue?.id) return;
    const interval = window.setInterval(() => {
      void fetchQueueStatus(queueData.queue.id, normalizedPhone, queueData.queue.cancelToken);
    }, 20000);
    return () => window.clearInterval(interval);
  }, [fetchQueueStatus, queueData?.queue?.id, queueData?.queue?.cancelToken, normalizedPhone]);

  useEffect(() => {
    if (!queueData?.queue?.id || !normalizedPhone) return;
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    }

    const socket = socketRef.current;
    socket.emit('join-room', `queue:${queueData.queue.id}`);

    const refresh = () => {
      void fetchQueueStatus(queueData.queue.id, normalizedPhone, queueData.queue.cancelToken);
    };

    socket.on('queue:updated', refresh);
    socket.on('queue:status_changed', refresh);
    socket.on('queue:cancelled', refresh);

    return () => {
      socket.off('queue:updated', refresh);
      socket.off('queue:status_changed', refresh);
      socket.off('queue:cancelled', refresh);
    };
  }, [fetchQueueStatus, queueData?.queue?.id, queueData?.queue?.cancelToken, normalizedPhone]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const handleBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSlotError('');

    if (!shop) {
      setError('Tenant tidak ditemukan.');
      return;
    }
    if (!name.trim()) {
      setError('Nama wajib diisi.');
      return;
    }
    if (!normalizedPhone || normalizedPhone.length < 10) {
      setError('Nomor WhatsApp tidak valid.');
      return;
    }
    if (!selectedServiceId) {
      setError('Pilih layanan terlebih dahulu.');
      return;
    }
    if (!selectedBarberId) {
      setError('Pilih worker terlebih dahulu.');
      return;
    }

    setIsBooking(true);
    try {
      const response = await fetch(`${API_BASE_URL}/queues/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          barbershopId: shop.id,
          barberId: selectedBarberId,
          serviceId: selectedServiceId,
          customerName: name.trim(),
          customerPhone: normalizedPhone,
          scheduledDate: bookingDate,
          scheduledTime: slotTime,
          bookingType: 'ONLINE',
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) {
        const message = payload?.error?.message || payload?.message || 'Booking gagal.';
        if (response.status === 409) {
          setTakenSlots((prev) => new Set(prev).add(slotTime));
          setSlotError(`Slot ${slotTime} sudah penuh atau bentrok. Pilih slot lain.`);
        }
        throw new Error(message);
      }

      const queueId = payload?.data?.id;
      const cancelToken = payload?.data?.cancelToken;
      if (queueId && storageKey) {
        localStorage.setItem(storageKey, JSON.stringify({ queueId, phone: normalizedPhone, cancelToken }));
      }
      await fetchQueueStatus(queueId, normalizedPhone, cancelToken);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Booking gagal.';
      setError(message);
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!queueData?.queue?.id) return;
    setIsCancelling(true);
    try {
      const response = await fetch(`${API_BASE_URL}/queues/public/${queueData.queue.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancelToken: queueData.queue.cancelToken,
          cancelReason: cancelReason || 'Batal booking',
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error?.message || payload?.message || 'Gagal membatalkan booking.');
      }
      if (storageKey) localStorage.removeItem(storageKey);
      setQueueData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membatalkan booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <Loader label="Memuat halaman tenant..." />
      </div>
    );
  }

  if (error && !shop) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <Card className="max-w-md text-center">
          <CardTitle>Tenant tidak ditemukan</CardTitle>
          <CardDescription className="mt-2">{error}</CardDescription>
          <Link href="/" className="mt-5 inline-block">
            <Button variant="primary">Kembali ke Root</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (queueData) {
    return (
      <main className="min-h-screen px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <Card className="text-center">
            <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/35 bg-emerald-500/15">
              <CheckCircle2 size={30} className="text-emerald-300" />
            </div>
            <Badge variant="success">BOOKED</Badge>
            <h1 className="mt-3 text-3xl font-black">Booking Berhasil</h1>
            <p className="mt-2 text-sm text-neutral-300">
              Detail booking Anda tersimpan. Tim barber akan melayani sesuai slot yang dipilih.
            </p>
          </Card>

          <Card className="space-y-2">
            <CardTitle>Detail Booking</CardTitle>
            <div className="grid gap-2 text-sm text-neutral-200">
              <p>Nama: {queueData.queue.customerName || name || '-'}</p>
              <p>WhatsApp: {queueData.queue.customerPhone || normalizedPhone || '-'}</p>
              <p>Layanan: {queueData.queue.service?.name || '-'}</p>
              <p>Worker: {queueData.queue.barber?.name || '-'}</p>
              <p>Tanggal: {queueData.queue.scheduledDate ? queueData.queue.scheduledDate.slice(0, 10) : '-'}</p>
              <p>Jam: {queueData.queue.scheduledTime || '-'}</p>
            </div>
          </Card>

          {queueData.queue.cancelToken ? (
            <Card className="space-y-3">
              <CardTitle>Batalkan Booking</CardTitle>
              <Textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Alasan pembatalan"
              />
              <Button variant="danger" className="w-full" loading={isCancelling} onClick={handleCancelBooking}>
                <XCircle size={14} />
                Batalkan Booking
              </Button>
            </Card>
          ) : null}

          <div className="text-center">
            <Link href={`/${slug}/admin`}>
              <Button variant="secondary">Login Admin</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-neutral-100">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 font-black text-neutral-950">
              {(shop?.name?.[0] || 'B').toUpperCase()}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Tenant Public</p>
              <h1 className="text-sm font-black">{shop?.name || slug}</h1>
            </div>
          </div>
          <Link href={`/${slug}/admin`} className="text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white">
            Login Admin
          </Link>
        </div>
      </nav>

      <section className="relative">
        <div
          className="h-[300px] w-full bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,.35), rgba(10,10,10,.95)), url(${shop?.coverImageUrl || 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1800&q=80'})`,
          }}
        />
        <div className="mx-auto -mt-22 w-full max-w-6xl px-4 pb-6 sm:px-6">
          <Card className="grid gap-5 lg:grid-cols-[auto_1fr]">
            <Image
              src={shop?.logoImageUrl || 'https://images.unsplash.com/photo-1532710093739-9470acff878f?auto=format&fit=crop&w=220&q=80'}
              alt={shop?.name || slug}
              width={96}
              height={96}
              className="h-24 w-24 rounded-2xl object-cover ring-2 ring-amber-400/40"
            />
            <div className="space-y-3">
              <Badge variant="info">Branding Tenant</Badge>
              <h2 className="text-3xl font-black">{shop?.name || slug}</h2>
              <p className="text-sm text-neutral-300">{shop?.description || 'Barber modern dengan booking online tanpa antre ribet.'}</p>
              <div className="grid gap-2 text-sm text-neutral-200 sm:grid-cols-2">
                <p className="inline-flex items-center gap-2"><Clock3 size={14} /> {shop?.operationalHours || '09:00 - 19:30'}</p>
                <p className="inline-flex items-center gap-2"><MapPin size={14} /> {shop?.address || '-'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {shop?.whatsapp ? (
                  <a href={`https://wa.me/${normalizePhone(shop.whatsapp)}`} target="_blank" rel="noreferrer">
                    <Button variant="primary"><PhoneCall size={14} /> WhatsApp</Button>
                  </a>
                ) : null}
                {shop?.instagram ? (
                  <a href={`https://instagram.com/${shop.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">
                    <Button variant="secondary">Instagram</Button>
                  </a>
                ) : null}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Card>
          <CardTitle>Lokasi</CardTitle>
          <CardDescription className="mt-1">Akses lokasi barber melalui Google Maps.</CardDescription>
          {shop?.mapsUrl ? (
            <iframe
              title="maps"
              src={shop.mapsUrl}
              className="mt-4 h-72 w-full rounded-2xl border border-white/10"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <p className="mt-4 text-sm text-neutral-400">Link Google Maps belum tersedia.</p>
          )}
        </Card>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-black">Layanan</h3>
          <Badge variant="muted">{servicesCatalog.length} layanan</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {servicesCatalog.map((service) => (
            <Card key={service.id} className={selectedServiceId === service.id ? 'border-amber-300/40' : ''}>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription className="mt-2">{service.description || 'Layanan profesional untuk grooming modern.'}</CardDescription>
              <div className="mt-4 flex items-center justify-between text-sm">
                <p className="font-black text-amber-300">{toRupiah(service.price)}</p>
                <p className="text-neutral-400">{service.duration} menit</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-black">Worker</h3>
          <Badge variant="muted">{barbers.length} worker</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {barbers.map((worker) => (
            <Card key={worker.id}>
              <div className="flex items-center gap-3">
                <Image
                  src={worker.photoUrl || 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80'}
                  alt={worker.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div>
                  <CardTitle className="text-base">{worker.name}</CardTitle>
                  <CardDescription>{worker.specializations?.join(', ') || 'Haircut & grooming'}</CardDescription>
                </div>
              </div>
              {worker.socialLinks?.instagram ? (
                <a
                  href={`https://instagram.com/${worker.socialLinks.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-amber-300 hover:text-amber-200"
                >
                  @{worker.socialLinks.instagram.replace('@', '')}
                </a>
              ) : null}
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Card className="space-y-4">
          <div>
            <h3 className="text-2xl font-black">Booking Online</h3>
            <p className="mt-1 text-sm text-neutral-400">Pilih layanan, worker, tanggal, dan jam slot yang tersedia.</p>
          </div>

          <form onSubmit={handleBooking} className="grid gap-4 md:grid-cols-2">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nama"
              autoComplete="name"
              required
            />
            <Input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="WhatsApp"
              autoComplete="tel"
              required
            />

            <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-400">
              Layanan
              <select
                value={selectedServiceId}
                onChange={(event) => setSelectedServiceId(event.target.value)}
                className="min-h-11 rounded-xl border border-white/15 bg-neutral-950/75 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/25"
                required
              >
                <option value="">Pilih layanan</option>
                {servicesCatalog.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} • {toRupiah(service.price)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-400">
              Worker
              <select
                value={selectedBarberId}
                onChange={(event) => setSelectedBarberId(event.target.value)}
                className="min-h-11 rounded-xl border border-white/15 bg-neutral-950/75 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/25"
                required
              >
                <option value="">Pilih worker</option>
                {filteredWorkers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-400">
              Tanggal
              <Input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={bookingDate}
                onChange={(event) => setBookingDate(event.target.value)}
                required
              />
            </label>

            <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-400">
              Jam Slot
              <select
                value={slotTime}
                onChange={(event) => setSlotTime(event.target.value as (typeof SLOT_OPTIONS)[number])}
                className="min-h-11 rounded-xl border border-white/15 bg-neutral-950/75 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/25"
              >
                {SLOT_OPTIONS.map((slot) => (
                  <option
                    key={slot}
                    value={slot}
                    disabled={takenSlots.has(slot)}
                  >
                    {slot}{takenSlots.has(slot) ? ' (penuh)' : ''}
                  </option>
                ))}
              </select>
            </label>

            <div className="md:col-span-2">
              <Card className="rounded-2xl p-4">
                <p className="text-xs uppercase tracking-wider text-neutral-500">Ringkasan</p>
                <p className="mt-1 text-sm text-neutral-200">
                  {selectedService?.name || '-'} • {selectedWorker?.name || '-'} • {bookingDateLabel} • {slotTime}
                </p>
              </Card>
            </div>

            {slotError ? <Toast variant="danger" className="md:col-span-2">{slotError}</Toast> : null}
            {error ? <Toast variant="danger" className="md:col-span-2">{error}</Toast> : null}

            <div className="md:col-span-2">
              <Button type="submit" variant="primary" size="lg" className="w-full" loading={isBooking}>
                <CalendarDays size={15} />
                Booking
              </Button>
            </div>
          </form>
        </Card>
      </section>

      <footer className="mt-8 border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-7 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{shop?.name || slug} • Powered by Malas Ngantri</p>
          <p>© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </main>
  );
}
