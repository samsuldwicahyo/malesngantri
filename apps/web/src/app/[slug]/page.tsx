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
  QUEUE_STATUS_LABEL,
  type QueueTicket,
  type TenantState,
} from '@/features/tenant/types';

type QueueMessage = {
  type: 'SYNC_STATE';
  payload: TenantState;
};

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

  const queues = useMemo(() => tenantState?.queues ?? [], [tenantState]);

  const activeQueues = useMemo(() => {
    return queues
      .filter((item) => isActiveQueueStatus(item.status))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [queues]);

  const monitoredQueue = useMemo<QueueTicket | null>(() => {
    const sanitized = customerWhatsapp.replace(/\D/g, '');
    if (!sanitized) {
      return null;
    }

    const matches = queues
      .filter((item) => item.customerWhatsapp.replace(/\D/g, '') === sanitized)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return matches[0] ?? null;
  }, [customerWhatsapp, queues]);

  const estimatedWaitMinutes = useMemo(() => {
    if (!tenantState || !monitoredQueue) {
      return null;
    }

    if (!isActiveQueueStatus(monitoredQueue.status)) {
      return 0;
    }

    return activeQueues
      .slice(0, countQueueAhead(activeQueues, monitoredQueue.id))
      .reduce((total, item) => {
        const service = tenantState.services.find((svc) => svc.id === item.serviceId);
        return total + (service?.durationMinutes ?? 0);
      }, 0);
  }, [activeQueues, monitoredQueue, tenantState]);

  const queueAhead = useMemo(() => {
    if (!monitoredQueue) {
      return null;
    }

    return countQueueAhead(activeQueues, monitoredQueue.id);
  }, [activeQueues, monitoredQueue]);

  const joinQueue = (event: FormEvent<HTMLFormElement>) => {
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
      setError('Pilih pemangkas rambut dan layanan.');
      return;
    }

    const next = addQueueTicket(tenantState, {
      customerName: customerName.trim(),
      customerWhatsapp: cleanWhatsapp,
      barberId,
      serviceId,
      source: 'ONLINE',
    });

    setError('');
    setTenantState(next);
    persistTenantState(slug, next);
    broadcast(next);
  };

  const cancelQueue = () => {
    if (!tenantState || !monitoredQueue || !slug) {
      return;
    }

    if (!['WAITING', 'CALLED'].includes(monitoredQueue.status)) {
      return;
    }

    const next = updateQueueStatus(tenantState, monitoredQueue.id, 'CANCELED');
    setTenantState(next);
    persistTenantState(slug, next);
    broadcast(next);
  };

  if (!slug || !tenantState) {
    return <main className="min-h-screen bg-neutral-950" />;
  }

  if (tenantState.tenant.subscriptionStatus !== 'ACTIVE') {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
          <h1 className="text-3xl font-black">Tenant Tidak Aktif</h1>
          <p className="mt-3 text-sm text-red-100/90">
            Barbershop ini belum memiliki langganan aktif. Hubungi admin barbershop atau support
            platform untuk aktivasi.
          </p>
          <Link href="/" className="mt-6 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-bold text-neutral-900">
            Kembali ke Landing Page
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,rgba(248,113,113,0.2),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(59,130,246,0.2),transparent_35%),#05060a] px-6 py-10 text-neutral-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-rose-200/90">
            {tenantState.tenant.slug}
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black leading-tight">{tenantState.tenant.name}</h1>
              <p className="mt-2 text-sm text-neutral-300">
                {tenantState.tenant.address} • {tenantState.tenant.operationalHours}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/${slug}/admin`}
                className="rounded-2xl border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10"
              >
                Masuk Admin
              </Link>
              <a
                href={`https://wa.me/${tenantState.tenant.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-950"
              >
                Hubungi WA Toko
              </a>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={joinQueue}
            className="rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur"
          >
            <h2 className="text-xl font-black">Ambil Nomor Antrian</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Alur: daftar/login customer → pilih barber → pilih layanan → sistem kirim nomor dan
              estimasi.
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
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                  WhatsApp
                </span>
                <input
                  value={customerWhatsapp}
                  onChange={(event) => setCustomerWhatsapp(event.target.value)}
                  className="rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-rose-400"
                  placeholder="62812xxxx"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Pilih Pemangkas
                </span>
                <select
                  value={barberId}
                  onChange={(event) => setBarberId(event.target.value)}
                  className="rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-rose-400"
                >
                  <option value="">Pilih barber...</option>
                  {tenantState.barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Pilih Styling / Layanan
                </span>
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
              Ambil Antrian Sekarang
            </button>
            <p className="mt-2 text-xs text-neutral-500">
              Privasi: nomor WhatsApp hanya terlihat di panel admin tenant.
            </p>
          </form>

          <div className="rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur">
            <h2 className="text-xl font-black">Status Antrian Customer</h2>
            {monitoredQueue ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Nomor Antrian</p>
                  <p className="mt-1 text-4xl font-black text-rose-300">{monitoredQueue.queueCode}</p>
                  <p className="mt-1 text-sm text-neutral-300">
                    Status:{' '}
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-bold ${QUEUE_STATUS_BADGE[monitoredQueue.status]}`}
                    >
                      {QUEUE_STATUS_LABEL[monitoredQueue.status]}
                    </span>
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Antrian di Depan</p>
                    <p className="mt-1 text-2xl font-black">{queueAhead ?? 0}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Estimasi Tunggu</p>
                    <p className="mt-1 text-2xl font-black">{estimatedWaitMinutes ?? 0} menit</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={cancelQueue}
                  disabled={!['WAITING', 'CALLED'].includes(monitoredQueue.status)}
                  className="w-full rounded-xl border border-rose-400/50 bg-rose-500/10 px-4 py-3 text-sm font-bold uppercase tracking-widest text-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancel Antrian
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-neutral-950/60 p-6 text-sm text-neutral-400">
                Isi nomor WhatsApp yang dipakai untuk antri agar status muncul real-time tanpa refresh.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">Snapshot Antrian Saat Ini</h2>
            <p className="text-xs text-neutral-500">Realtime demo via BroadcastChannel antar tab browser</p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[740px] text-left text-sm">
              <thead className="text-xs uppercase tracking-widest text-neutral-400">
                <tr>
                  <th className="py-3">No</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Layanan</th>
                  <th className="py-3">Barber</th>
                  <th className="py-3">Sumber</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeQueues.map((item) => {
                  const service = tenantState.services.find((svc) => svc.id === item.serviceId);
                  const barber = tenantState.barbers.find((row) => row.id === item.barberId);

                  return (
                    <tr key={item.id} className="border-t border-white/10">
                      <td className="py-3 font-black text-rose-300">{item.queueCode}</td>
                      <td className="py-3">{item.customerName}</td>
                      <td className="py-3">{service?.name ?? '-'}</td>
                      <td className="py-3">{barber?.name ?? '-'}</td>
                      <td className="py-3">{item.source}</td>
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
