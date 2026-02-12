"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  addQueueTicket,
  getAllowedTransitions,
  isActiveQueueStatus,
  loadTenantState,
  persistTenantState,
  updateQueueStatus,
} from '@/features/tenant/store';
import {
  QUEUE_STATUS_BADGE,
  QUEUE_STATUS_LABEL,
  type QueueStatus,
  type TenantState,
} from '@/features/tenant/types';

type QueueMessage = {
  type: 'SYNC_STATE';
  payload: TenantState;
};

const channelName = (slug: string): string => `malas-ngantri-tenant-${slug}`;

const toWaLink = (phone: string, message: string): string => {
  const normalized = phone.replace(/\D/g, '');
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};

export default function TenantAdminQueuePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [tenantState, setTenantState] = useState<TenantState | null>(() => {
    if (!slug) {
      return null;
    }
    return loadTenantState(slug);
  });
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [barberId, setBarberId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [error, setError] = useState('');
  const channelRef = useRef<BroadcastChannel | null>(null);

  const syncState = (next: TenantState) => {
    if (!slug) {
      return;
    }

    setTenantState(next);
    persistTenantState(slug, next);

    if (channelRef.current) {
      const payload: QueueMessage = { type: 'SYNC_STATE', payload: next };
      channelRef.current.postMessage(payload);
    }
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

  const queueRows = useMemo(() => {
    if (!tenantState) {
      return [];
    }

    return [...tenantState.queues].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [tenantState]);

  const queueStats = useMemo(() => {
    if (!tenantState) {
      return {
        waiting: 0,
        serving: 0,
        done: 0,
      };
    }

    return {
      waiting: tenantState.queues.filter((item) => item.status === 'WAITING').length,
      serving: tenantState.queues.filter((item) => item.status === 'SERVING').length,
      done: tenantState.queues.filter((item) => item.status === 'DONE').length,
    };
  }, [tenantState]);

  const addOfflineQueue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantState) {
      return;
    }

    const cleanWa = whatsapp.replace(/\D/g, '');

    if (!name.trim()) {
      setError('Nama customer wajib diisi.');
      return;
    }
    if (cleanWa.length < 10) {
      setError('Nomor WhatsApp customer tidak valid.');
      return;
    }
    if (!barberId || !serviceId) {
      setError('Pilih barber dan layanan untuk customer offline.');
      return;
    }

    setError('');
    const next = addQueueTicket(tenantState, {
      customerName: name.trim(),
      customerWhatsapp: cleanWa,
      barberId,
      serviceId,
      source: 'OFFLINE',
    });

    syncState(next);
    setName('');
    setWhatsapp('');
  };

  const moveQueueStatus = (queueId: string, nextStatus: QueueStatus) => {
    if (!tenantState) {
      return;
    }

    const next = updateQueueStatus(tenantState, queueId, nextStatus);
    syncState(next);
  };

  if (!slug || !tenantState) {
    return <main className="min-h-screen bg-neutral-950" />;
  }

  if (tenantState.tenant.subscriptionStatus !== 'ACTIVE') {
    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-20 text-neutral-100">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
          <h1 className="text-3xl font-black">Panel Admin Terkunci</h1>
          <p className="mt-2 text-sm text-red-100/90">
            Tenant tidak aktif karena langganan belum aktif. Aktivasi dilakukan oleh Super Admin.
          </p>
          <Link href="/super-admin" className="mt-6 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-bold text-neutral-900">
            Buka Panel Super Admin
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(251,146,60,0.22),transparent_35%),#07080e] px-6 py-10 text-neutral-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-200/90">
                {tenantState.tenant.slug}/admin
              </p>
              <h1 className="mt-2 text-4xl font-black">Dashboard Admin Antrian</h1>
              <p className="mt-2 text-sm text-neutral-300">
                Kelola antrean online + offline, update status, dan komunikasi WhatsApp manual.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/${slug}`}
                className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10"
              >
                View Customer Page
              </Link>
              <Link
                href="/super-admin"
                className="rounded-xl bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-neutral-900"
              >
                Super Admin
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Waiting</p>
            <p className="mt-2 text-3xl font-black text-amber-200">{queueStats.waiting}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Serving</p>
            <p className="mt-2 text-3xl font-black text-sky-200">{queueStats.serving}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Done</p>
            <p className="mt-2 text-3xl font-black text-emerald-200">{queueStats.done}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur">
            <h2 className="text-xl font-black">Manajemen Antrian</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Role `ADMIN_BARBER` dan `BARBER` bisa update status dengan transisi yang valid.
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[940px] text-left text-sm">
                <thead className="text-xs uppercase tracking-widest text-neutral-400">
                  <tr>
                    <th className="py-3">No</th>
                    <th className="py-3">Customer</th>
                    <th className="py-3">WA</th>
                    <th className="py-3">Barber</th>
                    <th className="py-3">Service</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Aksi</th>
                    <th className="py-3">WA Manual</th>
                  </tr>
                </thead>
                <tbody>
                  {queueRows.map((item) => {
                    const barber = tenantState.barbers.find((row) => row.id === item.barberId);
                    const service = tenantState.services.find((row) => row.id === item.serviceId);
                    const transitions = getAllowedTransitions(item.status);

                    return (
                      <tr key={item.id} className="border-t border-white/10 align-top">
                        <td className="py-3 font-black text-sky-200">{item.queueCode}</td>
                        <td className="py-3">{item.customerName}</td>
                        <td className="py-3">{item.customerWhatsapp}</td>
                        <td className="py-3">{barber?.name ?? '-'}</td>
                        <td className="py-3">{service?.name ?? '-'}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-bold ${QUEUE_STATUS_BADGE[item.status]}`}
                          >
                            {QUEUE_STATUS_LABEL[item.status]}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-2">
                            {transitions.length === 0 ? (
                              <span className="text-xs text-neutral-500">Final</span>
                            ) : (
                              transitions.map((next) => (
                                <button
                                  type="button"
                                  key={next}
                                  onClick={() => moveQueueStatus(item.id, next)}
                                  className="rounded-lg border border-white/20 px-2 py-1 text-xs font-bold uppercase tracking-widest hover:bg-white/10"
                                >
                                  {QUEUE_STATUS_LABEL[next]}
                                </button>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <a
                            href={toWaLink(
                              item.customerWhatsapp,
                              `Halo ${item.customerName}, status antrian ${item.queueCode} sekarang: ${QUEUE_STATUS_LABEL[item.status]}.`,
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-lg bg-emerald-500 px-3 py-1 text-xs font-black text-emerald-950"
                          >
                            Hubungi WhatsApp
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-6">
            <form
              onSubmit={addOfflineQueue}
              className="rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur"
            >
              <h2 className="text-lg font-black">Input Customer Offline</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Masukkan customer walk-in agar masuk ke antrean tenant yang sama.
              </p>

              <div className="mt-5 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Nama</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-sky-400"
                    placeholder="Nama customer"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">WhatsApp</span>
                  <input
                    value={whatsapp}
                    onChange={(event) => setWhatsapp(event.target.value)}
                    className="rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-sky-400"
                    placeholder="62812xxxx"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                    Pemangkas
                  </span>
                  <select
                    value={barberId}
                    onChange={(event) => setBarberId(event.target.value)}
                    className="rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-sky-400"
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
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Layanan</span>
                  <select
                    value={serviceId}
                    onChange={(event) => setServiceId(event.target.value)}
                    className="rounded-xl border border-white/15 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-sky-400"
                  >
                    <option value="">Pilih layanan...</option>
                    {tenantState.services.map((service) => (
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
                className="mt-5 w-full rounded-xl bg-sky-400 px-4 py-3 text-sm font-black uppercase tracking-widest text-sky-950 hover:bg-sky-300"
              >
                Tambah ke Antrean
              </button>
            </form>

            <div className="rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur">
              <h3 className="text-lg font-black">Privasi & Akses</h3>
              <ul className="mt-3 space-y-2 text-sm text-neutral-300">
                <li>Nomor WhatsApp hanya terlihat di panel admin tenant.</li>
                <li>Pesan WA dikirim manual oleh operator, bukan otomatis.</li>
                <li>Tenant non-aktif tidak bisa memproses antrean baru.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur">
              <h3 className="text-lg font-black">Realtime</h3>
              <p className="mt-2 text-sm text-neutral-300">
                Demo ini sinkron antartab browser memakai `BroadcastChannel`. Pada production,
                ganti dengan Pusher/Supabase Realtime.
              </p>
              <p className="mt-3 text-xs text-neutral-500">
                Active queue: {queueRows.filter((item) => isActiveQueueStatus(item.status)).length}
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
