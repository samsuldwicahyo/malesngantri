"use client";

import { useState, useEffect, useMemo, useRef, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import {
    Users,
    Clock,
    MapPin,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Calendar,
    User,
    PhoneCall,
    Scissors
} from 'lucide-react';
import Link from 'next/link';
import { io, type Socket } from 'socket.io-client';

type Barbershop = {
    id: string;
    name: string;
    address?: string | null;
    activeQueues?: number;
};

type Service = {
    id: string;
    name: string;
    price: number;
    duration: number;
};

type Barber = {
    id: string;
    name: string;
    status: string;
    activeQueues: number;
    services: Service[];
};

type QueueStatus = {
    id: string;
    queueNumber: string;
    position: number;
    estimatedStart: string;
    estimatedEnd: string;
    status: string;
    barber: { id: string; name: string };
    service: { id: string; name: string; duration: number };
};

type QueuePayload = {
    queue: QueueStatus;
    activeQueueNumber: string | null;
    aheadCount: number;
    estimatedWaitMinutes: number | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export default function QueuePage() {
    const { slug } = useParams();
    const [shop, setShop] = useState<Barbershop | null>(null);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedBarberId, setSelectedBarberId] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [queueData, setQueueData] = useState<QueuePayload | null>(null);
    const [cancelReason, setCancelReason] = useState('Saya batal antri');
    const [isCancelling, setIsCancelling] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    const selectedBarber = useMemo(
        () => barbers.find((b) => b.id === selectedBarberId) || null,
        [barbers, selectedBarberId]
    );

    const selectedService = useMemo(() => {
        if (!selectedBarber) return null;
        return selectedBarber.services.find((s) => s.id === selectedServiceId) || null;
    }, [selectedBarber, selectedServiceId]);

    const normalizedPhone = phone.replace(/[^\d+]/g, '');
    const storedKey = typeof slug === 'string' ? `queue:${slug}` : null;

    useEffect(() => {
        if (typeof slug !== 'string') return;
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const shopRes = await fetch(`${API_BASE_URL}/barbershops/slug/${slug}`);
                const shopJson = await shopRes.json();
                if (!shopRes.ok) {
                    throw new Error(shopJson?.error?.message || 'Barbershop tidak ditemukan');
                }

                setShop(shopJson.data);

                const barbersRes = await fetch(`${API_BASE_URL}/barbershops/${shopJson.data.id}/barbers`);
                const barbersJson = await barbersRes.json();
                if (!barbersRes.ok) {
                    throw new Error(barbersJson?.error?.message || 'Gagal memuat data barber');
                }

                setBarbers(barbersJson.data || []);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Gagal memuat data';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [slug]);

    useEffect(() => {
        if (!storedKey) return;
        const raw = localStorage.getItem(storedKey);
        if (!raw) return;
        try {
            const stored = JSON.parse(raw) as { queueId: string; phone: string };
            if (stored.queueId && stored.phone) {
                setPhone(stored.phone);
                fetchQueueStatus(stored.queueId, stored.phone);
            }
        } catch {
            localStorage.removeItem(storedKey);
        }
    }, [storedKey]);

    useEffect(() => {
        if (!queueData) return;
        const interval = setInterval(() => {
            fetchQueueStatus(queueData.queue.id, normalizedPhone);
        }, 20000);
        return () => clearInterval(interval);
    }, [queueData, normalizedPhone]);

    useEffect(() => {
        if (!queueData?.queue?.id || !normalizedPhone) return;

        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
        }
        const socket = socketRef.current;
        const roomId = `queue:${queueData.queue.id}`;

        socket.emit('join-room', roomId);

        const handleUpdate = () => {
            fetchQueueStatus(queueData.queue.id, normalizedPhone);
        };

        socket.on('queue:updated', handleUpdate);
        socket.on('queue:status_changed', handleUpdate);
        socket.on('queue:cancelled', handleUpdate);

        return () => {
            socket.off('queue:updated', handleUpdate);
            socket.off('queue:status_changed', handleUpdate);
            socket.off('queue:cancelled', handleUpdate);
        };
    }, [queueData?.queue?.id, normalizedPhone]);

    useEffect(() => {
        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, []);

    const fetchQueueStatus = async (queueId: string, phoneValue: string) => {
        const res = await fetch(`${API_BASE_URL}/queues/public/${queueId}?phone=${encodeURIComponent(phoneValue)}`);
        const json = await res.json();
        if (res.ok) {
            setQueueData(json.data);
        }
    };

    const handleJoinQueue = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Nama wajib diisi.');
            return;
        }
        if (!normalizedPhone || normalizedPhone.length < 10) {
            setError('Nomor WhatsApp tidak valid.');
            return;
        }
        if (!selectedBarberId) {
            setError('Pilih barber terlebih dahulu.');
            return;
        }
        if (!selectedServiceId) {
            setError('Pilih layanan terlebih dahulu.');
            return;
        }
        if (!shop) {
            setError('Data barbershop belum tersedia.');
            return;
        }

        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        let role: string | null = null;
        try {
            const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;
            role = storedUser?.role || null;
        } catch {
            role = null;
        }

        setIsJoining(true);
        try {
        const scheduledDate = new Date().toISOString();
        const payloadBody = {
            barbershopId: shop.id,
            barberId: selectedBarberId,
            serviceId: selectedServiceId,
            customerName: name.trim(),
            customerPhone: normalizedPhone,
            scheduledDate
        };

            const response =
                accessToken && role === 'CUSTOMER'
                    ? await fetch(`${API_BASE_URL}/queues`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({
                            ...payloadBody,
                            bookingType: 'ONLINE',
                            scheduledDate: new Date().toISOString()
                        })
                    })
                    : await fetch(`${API_BASE_URL}/queues/public`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payloadBody)
                    });

            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error?.message || 'Gagal masuk antrian');
            }

            const queueId = payload?.data?.id;
            if (queueId && storedKey) {
                localStorage.setItem(storedKey, JSON.stringify({ queueId, phone: normalizedPhone }));
            }
            await fetchQueueStatus(queueId, normalizedPhone);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal masuk antrian';
            setError(message);
        } finally {
            setIsJoining(false);
        }
    };

    const handleCancelQueue = async () => {
        if (!queueData || !normalizedPhone) return;
        setIsCancelling(true);
        try {
            const response = await fetch(`${API_BASE_URL}/queues/public/${queueData.queue.id}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerPhone: normalizedPhone,
                    cancelReason: cancelReason || 'Saya batal antri'
                })
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error?.message || 'Gagal membatalkan antrian');
            }
            if (storedKey) {
                localStorage.removeItem(storedKey);
            }
            setQueueData(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal membatalkan antrian';
            setError(message);
        } finally {
            setIsCancelling(false);
        }
    };

    const formatTime = (value?: string) => {
        if (!value) return '-';
        const date = new Date(value);
        return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date);
    };

    const estimatedWaitText = queueData?.estimatedWaitMinutes != null
        ? `~${queueData.estimatedWaitMinutes} menit`
        : 'Menunggu estimasi';

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white p-6 font-sans flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
            </div>
        );
    }

    if (error && !shop) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white p-6 font-sans flex items-center justify-center">
                <div className="text-center space-y-3">
                    <h1 className="text-2xl font-bold">Oops!</h1>
                    <p className="text-neutral-400">{error}</p>
                    <Link href="/" className="text-amber-500 font-semibold">Kembali ke Beranda</Link>
                </div>
            </div>
        );
    }

    if (queueData) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
                <div className="max-w-md mx-auto space-y-8 pt-12">
                    <div className="text-center space-y-4">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-4 animate-bounce">
                            <CheckCircle2 size={40} />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Antrian kamu aktif</h1>
                        <p className="text-neutral-400">Pantau estimasi dan status barber di bawah.</p>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-white/5 p-8 shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Users size={80} />
                        </div>

                        <div className="space-y-6">
                            <div className="text-center">
                                <span className="text-neutral-500 text-sm uppercase tracking-widest font-semibold">Nomor Antrian</span>
                                <div className="text-5xl font-black text-amber-500 mt-2">{queueData.queue.queueNumber}</div>
                                <p className="text-xs text-neutral-500 mt-1">Posisi ke-{queueData.queue.position}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="bg-neutral-800/50 rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                                        <Clock size={14} />
                                        <span>Estimasi Tunggu</span>
                                    </div>
                                    <div className="text-lg font-bold">{estimatedWaitText}</div>
                                </div>
                                <div className="bg-neutral-800/50 rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                                        <Calendar size={14} />
                                        <span>Estimasi Mulai</span>
                                    </div>
                                    <div className="text-lg font-bold">{formatTime(queueData.queue.estimatedStart)}</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Barber</span>
                                    <span className="font-semibold text-white">{queueData.queue.barber?.name || '-'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Layanan</span>
                                    <span className="font-semibold text-white">{queueData.queue.service?.name || '-'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Sedang Dilayani</span>
                                    <span className="font-semibold text-white">{queueData.activeQueueNumber || 'Belum ada'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Antrian di depan</span>
                                    <span className="font-semibold text-white">{queueData.aheadCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <input
                            type="text"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="w-full bg-neutral-900 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                            placeholder="Alasan batal"
                        />
                        <button
                            onClick={handleCancelQueue}
                            disabled={isCancelling}
                            className="w-full py-4 rounded-2xl bg-neutral-900 border border-white/10 text-neutral-400 font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-60"
                        >
                            {isCancelling ? 'Membatalkan...' : 'Batalkan Antrian'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-amber-500/30 font-sans">
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-neutral-950/50 backdrop-blur-xl sticky top-0 z-50">
                <Link href="/" className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div className="text-center">
                    <h2 className="text-sm font-bold tracking-wider uppercase text-amber-500">Live Queue</h2>
                </div>
                <div className="w-10"></div>
            </div>

            <main className="max-w-md mx-auto p-6 space-y-8 pb-12">
                {/* Shop Info Card */}
                <section className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight">{shop?.name}</h1>
                            <p className="text-neutral-500 text-sm flex items-center gap-1">
                                <MapPin size={14} /> {shop?.address || '-'}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-amber-500 rounded-2xl rotate-3 flex items-center justify-center font-bold text-black border-2 border-white/10 shadow-lg shadow-amber-500/20">
                            {shop?.name?.[0] || 'B'}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-neutral-900 rounded-2xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1 uppercase tracking-wider font-bold">
                                <Users size={14} />
                                <span>In Queue</span>
                            </div>
                            <div className="text-2xl font-black">{shop?.activeQueues ?? 0}</div>
                        </div>
                        <div className="bg-neutral-900 rounded-2xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1 uppercase tracking-wider font-bold">
                                <Clock size={14} />
                                <span>Wait Time</span>
                            </div>
                            <div className="text-2xl font-black">Real-time</div>
                        </div>
                    </div>
                </section>

                {/* Join Queue Form */}
                <section className="space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold tracking-tight">Masuk Antrian</h3>
                        <p className="text-neutral-500 text-sm">Isi data dan pilih barber terlebih dulu</p>
                    </div>

                    <form onSubmit={handleJoinQueue} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Your Full Name"
                                    className="w-full bg-neutral-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium text-white"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
                                    <PhoneCall size={18} />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="Nomor WhatsApp (08xx / +62)"
                                    className="w-full bg-neutral-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium text-white"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Pilih Barber</h4>
                            <div className="grid gap-3">
                                {barbers.map((barber) => (
                                    <button
                                        type="button"
                                        key={barber.id}
                                        onClick={() => {
                                            setSelectedBarberId(barber.id);
                                            const firstService = barber.services[0];
                                            setSelectedServiceId(firstService ? firstService.id : '');
                                        }}
                                        className={`text-left p-4 rounded-2xl border transition-all ${selectedBarberId === barber.id
                                            ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500'
                                            : 'bg-neutral-900 border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold">{barber.name}</p>
                                                <p className="text-xs text-neutral-500">{barber.status}</p>
                                            </div>
                                            <div className="text-xs text-neutral-400">{barber.activeQueues} antrian</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Pilih Layanan</h4>
                            {selectedBarber ? (
                                <div className="grid gap-3">
                                    {selectedBarber.services.map((s) => (
                                        <label
                                            key={s.id}
                                            className={`relative flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${selectedServiceId === s.id
                                                ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500'
                                                : 'bg-neutral-900 border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="service"
                                                value={s.id}
                                                className="sr-only"
                                                onChange={() => setSelectedServiceId(s.id)}
                                                required
                                            />
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedServiceId === s.id ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400'
                                                    }`}>
                                                    <Scissors size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold">{s.name}</div>
                                                    <div className="text-xs text-neutral-500">{s.duration} menit</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-white">Rp {s.price.toLocaleString('id-ID')}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-500">Pilih barber untuk melihat layanan.</p>
                            )}
                        </div>

                        {error ? (
                            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300">
                                {error}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={isJoining}
                            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-black py-5 rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 group"
                        >
                            {isJoining ? (
                                <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    Masuk Antrian
                                    <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </section>

                {/* Info */}
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-200/70 text-sm">
                    <AlertCircle size={20} className="shrink-0" />
                    <p>You&apos;ll receive a WhatsApp notification when you are 2 spots away from the front of the line.</p>
                </div>
            </main>
        </div>
    );
}
