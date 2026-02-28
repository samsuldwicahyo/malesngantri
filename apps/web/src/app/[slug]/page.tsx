"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  addQueueTicket,
  countQueueAhead,
  isActiveQueueStatus,
  loadTenantState,
  persistTenantState,
  updateQueueStatus,
} from '@/features/tenant/store';
import {
  QUEUE_STATUS_BADGE,
  QUEUE_STATUS_HELP,
  QUEUE_STATUS_LABEL,
  type QueueTicket,
  type TenantState,
} from '@/features/tenant/types';

type QueueMessage = {
  type: 'SYNC_STATE';
  payload: TenantState;
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

const channelName = (slug: string): string => `malas-ngantri-tenant-${slug}`;

export default function TenantCustomerPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [tenantState, setTenantState] = useState<TenantState | null>(() => {
    if (!slug) {
      return null;
    }
    return loadTenantState(slug);
  });
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [barberId, setBarberId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slotTime, setSlotTime] = useState<(typeof SLOT_OPTIONS)[number]>('10:00');
  const [error, setError] = useState('');
  const channelRef = useRef<BroadcastChannel | null>(null);

  const broadcast = (state: TenantState) => {
    if (!channelRef.current) {
      return;
    }

    const message: QueueMessage = {
      type: 'SYNC_STATE',
      payload: state,
    };

    channelRef.current.postMessage(message);
  };

  useEffect(() => {
    if (!slug) {
      return;
    }

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(channelName(slug));
      channelRef.current = channel;
      channel.onmessage = (event: MessageEvent<QueueMessage>) => {
        if (event.data?.type === 'SYNC_STATE') {
          setTenantState(event.data.payload);
        }
      };

      return () => {
        channel.close();
        channelRef.current = null;
      };
    }

    return;
  }, [slug]);

  const bookings = useMemo(() => tenantState?.queues ?? [], [tenantState]);

  const activeBookings = useMemo(() => {
    return bookings
      .filter((item) => isActiveQueueStatus(item.status))
      .sort((a, b) => `${a.bookingDate} ${a.slotTime}`.localeCompare(`${b.bookingDate} ${b.slotTime}`));
  }, [bookings]);

  const monitoredBooking = useMemo<QueueTicket | null>(() => {
    const sanitized = customerWhatsapp.replace(/\D/g, '');
    if (!sanitized) {
      return null;
    }

    const matches = bookings
      .filter((item) => item.customerWhatsapp.replace(/\D/g, '') === sanitized)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return matches[0] ?? null;
  }, [customerWhatsapp, bookings]);

  const bookingAhead = useMemo(() => {
    if (!monitoredBooking) {
      return null;
    }

    return countQueueAhead(activeBookings, monitoredBooking.id);
  }, [activeBookings, monitoredBooking]);

  const estimatedDurationAhead = useMemo(() => {
    if (!tenantState || !monitoredBooking) {
      return null;
    }

    if (!isActiveQueueStatus(monitoredBooking.status)) {
      return 0;
    }

    const filtered = activeBookings.filter(
      (item) =>
        item.id !== monitoredBooking.id &&
        item.barberId === monitoredBooking.barberId &&
        item.bookingDate === monitoredBooking.bookingDate &&
        item.slotTime <= monitoredBooking.slotTime,
    );

    return filtered.reduce((total, item) => {
      const service = tenantState.services.find((svc) => svc.id === item.serviceId);
      return total + (service?.durationMinutes ?? 0);
    }, 0);
  }, [activeBookings, monitoredBooking, tenantState]);

  const joinBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantState || !slug) {
      return;
    }

    const cleanWhatsapp = customerWhatsapp.replace(/\D/g, '');
    if (!customerName.trim()) {
      setError('Nama wajib diisi.');
      return;
    }
    if (cleanWhatsapp.length < 10) {
      setError('Nomor WhatsApp tidak valid.');
      return;
    }
    if (!barberId || !serviceId) {
      setError('Pilih worker/pemangkas rambut dan layanan.');
      return;
    }

    const next = addQueueTicket(tenantState, {
      customerName: customerName.trim(),
      customerWhatsapp: cleanWhatsapp,
      barberId,
      serviceId,
      bookingDate,
      slotTime,
      source: 'ONLINE',
    });

    setError('');
    setTenantState(next);
    persistTenantState(slug, next);
    broadcast(next);
  };

  const cancelBooking = () => {
    if (!tenantState || !monitoredBooking || !slug) {
      return;
    }

    if (!['BOOKED', 'CHECKED_IN'].includes(monitoredBooking.status)) {
      return;
    }

    const next = updateQueueStatus(tenantState, monitoredBooking.id, 'CANCELED');
    setTenantState(next);
    persistTenantState(slug, next);
    broadcast(next);
  };

  if (!slug || !tenantState) {
    return <main className="min-h-screen bg-neutral-950" />;
  }

  if (tenantState.tenant.subscriptionStatus !== 'ACTIVE') {
    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-20 text-neutral-100">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
          <h1 className="text-3xl font-black">Tenant Tidak Aktif</h1>
          <p className="mt-3 text-sm text-red-100/90">
            Langganan tenant tidak aktif, booking online sementara dinonaktifkan.
          </p>
          <Link href="/" className="mt-6 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-bold text-neutral-900">
            Kembali ke Landing Page
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,rgba(248,113,113,0.2),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(59,130,246,0.2),transparent_35%),#05060a] px-4 py-8 text-neutral-100 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-rose-200/90">/t/{tenantState.tenant.slug}</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl">{tenantState.tenant.name}</h1>
              <p className="mt-2 text-sm text-neutral-300">
                {tenantState.tenant.address} • {tenantState.tenant.operationalHours}
              </p>
            </div>
            <div className="flex w-full flex-wrap gap-3 sm:w-auto">
              <Link
                href={`/t/${slug}/admin`}
                className="w-full rounded-2xl border border-white/20 px-4 py-2 text-center text-xs font-bold uppercase tracking-widest hover:bg-white/10 sm:w-auto"
              >
                Masuk Admin
              </Link>
              <a
                href={`https://wa.me/${tenantState.tenant.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-2xl bg-emerald-500 px-4 py-2 text-center text-xs font-black uppercase tracking-widest text-emerald-950 sm:w-auto"
              >
                Kontak WhatsApp
              </a>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={joinBooking} className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur sm:p-6">
            <h2 className="text-xl font-black">Booking Online (Pilih Jam)</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Isi data singkat, lalu pilih pemangkas, layanan, tanggal, dan jam kedatangan.
            </p>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Nama</span>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-rose-400"
                  placeholder="Nama customer"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">WhatsApp</span>
                <input
                  value={customerWhatsapp}
                  onChange={(event) => setCustomerWhatsapp(event.target.value)}
                  className="rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-rose-400"
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
                    className="rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-rose-400"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Slot Waktu</span>
                  <select
                    value={slotTime}
                    onChange={(event) => setSlotTime(event.target.value as (typeof SLOT_OPTIONS)[number])}
                    className="rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-rose-400"
                  >
                    {SLOT_OPTIONS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Pilih Pemangkas</span>
                <select
                  value={barberId}
                  onChange={(event) => setBarberId(event.target.value)}
                  className="rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-rose-400"
                >
                  <option value="">Pilih pemangkas...</option>
                  {tenantState.barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Pilih Layanan</span>
                <select
                  value={serviceId}
                  onChange={(event) => setServiceId(event.target.value)}
                  className="rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-rose-400"
                >
                  <option value="">Pilih layanan...</option>
                  {tenantState.services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.durationMinutes} menit)
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {error ? <p className="mt-3 text-sm font-semibold text-rose-300">{error}</p> : null}

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-rose-400 px-4 py-3 text-sm font-black uppercase tracking-widest text-rose-950 hover:bg-rose-300"
            >
              Booking Sekarang
            </button>
            <p className="mt-2 text-xs text-neutral-500">Nomor WhatsApp hanya terlihat di panel admin tenant.</p>
          </form>

          <div className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur sm:p-6">
            <h2 className="text-xl font-black">Pantau Status Booking</h2>
            {monitoredBooking ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Kode Booking</p>
                  <p className="mt-1 text-4xl font-black text-rose-300">{monitoredBooking.bookingCode}</p>
                  <p className="mt-1 text-sm text-neutral-300">
                    Slot: {monitoredBooking.bookingDate} • {monitoredBooking.slotTime}
                  </p>
                  <p className="mt-1 text-sm text-neutral-300">
                    Status:{' '}
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-bold ${QUEUE_STATUS_BADGE[monitoredBooking.status]}`}
                    >
                      {QUEUE_STATUS_LABEL[monitoredBooking.status]}
                    </span>
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Booking di Depan</p>
                    <p className="mt-1 text-2xl font-black">{bookingAhead ?? 0}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Estimasi Durasi Tunggu</p>
                    <p className="mt-1 text-2xl font-black">{estimatedDurationAhead ?? 0} menit</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={cancelBooking}
                  disabled={!['BOOKED', 'CHECKED_IN'].includes(monitoredBooking.status)}
                  className="w-full rounded-xl border border-rose-400/50 bg-rose-500/10 px-4 py-3 text-sm font-bold uppercase tracking-widest text-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Batalkan Booking
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-neutral-950/60 p-4 text-sm text-neutral-400 sm:p-6">
                Isi nomor WhatsApp yang dipakai saat booking untuk melihat status terbaru.
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-white/10 bg-neutral-950/70 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Arti Status</p>
              <div className="mt-2 space-y-1 text-xs text-neutral-300">
                {Object.entries(QUEUE_STATUS_HELP).map(([key, value]) => (
                  <p key={key}>
                    <span className="font-bold text-neutral-100">{QUEUE_STATUS_LABEL[key as keyof typeof QUEUE_STATUS_HELP]}:</span>{' '}
                    {value}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">Daftar Booking Hari Ini</h2>
            <p className="text-xs text-neutral-500">Data akan ikut berubah saat admin update status</p>
          </div>

          <div className="mt-4 space-y-3 md:hidden">
            {activeBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/20 bg-neutral-950/60 p-4 text-sm text-neutral-400">
                Belum ada booking aktif hari ini.
              </div>
            ) : (
              activeBookings.map((item) => {
                const service = tenantState.services.find((svc) => svc.id === item.serviceId);
                const barber = tenantState.barbers.find((row) => row.id === item.barberId);

                return (
                  <article key={item.id} className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-black text-rose-300">{item.bookingCode}</p>
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${QUEUE_STATUS_BADGE[item.status]}`}
                      >
                        {QUEUE_STATUS_LABEL[item.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold">{item.customerName}</p>
                    <p className="mt-1 text-xs text-neutral-400">
                      {item.bookingDate} • {item.slotTime}
                    </p>
                    <p className="mt-1 text-xs text-neutral-300">Layanan: {service?.name ?? '-'}</p>
                    <p className="mt-1 text-xs text-neutral-300">Pemangkas: {barber?.name ?? '-'}</p>
                  </article>
                );
              })
            )}
          </div>

          <div className="mt-4 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="text-xs uppercase tracking-widest text-neutral-400">
                <tr>
                  <th className="py-3">Kode</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Tanggal</th>
                  <th className="py-3">Slot</th>
                  <th className="py-3">Layanan</th>
                  <th className="py-3">Worker</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeBookings.map((item) => {
                  const service = tenantState.services.find((svc) => svc.id === item.serviceId);
                  const barber = tenantState.barbers.find((row) => row.id === item.barberId);

                  return (
                    <tr key={item.id} className="border-t border-white/10">
                      <td className="py-3 font-black text-rose-300">{item.bookingCode}</td>
                      <td className="py-3">{item.customerName}</td>
                      <td className="py-3">{item.bookingDate}</td>
                      <td className="py-3">{item.slotTime}</td>
                      <td className="py-3">{service?.name ?? '-'}</td>
                      <td className="py-3">{barber?.name ?? '-'}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-bold ${QUEUE_STATUS_BADGE[item.status]}`}
                        >
                          {QUEUE_STATUS_LABEL[item.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
