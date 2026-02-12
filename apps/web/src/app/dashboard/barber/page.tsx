"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    Clock,
    Play,
    CheckCircle,
    PauseCircle,
    Moon,
    Power,
    ChevronRight,
    Scissors,
    RefreshCw,
    User
} from 'lucide-react';
import { io, type Socket } from 'socket.io-client';

type UserProfile = {
    id: string;
    fullName: string;
    email: string;
    role: string;
    barbershop?: { id: string; name: string };
};

type BarberProfile = {
    id: string;
    name: string;
    status: string;
    barbershopId: string;
    phone?: string | null;
    photoUrl?: string | null;
    specializations?: string[] | null;
    socialLinks?: {
        instagram?: string;
        tiktok?: string;
        facebook?: string;
        whatsapp?: string;
        website?: string;
    } | null;
};

type Service = {
    id: string;
    name: string;
    duration: number;
    price?: number;
};

type QueueItem = {
    id: string;
    queueNumber: string;
    customerName?: string | null;
    estimatedStart?: string | null;
    estimatedEnd?: string | null;
    status: string;
    service?: { name: string; duration: number };
    customer?: { fullName?: string | null };
};

type BarberStats = {
    totalQueues: number;
    completedQueues: number;
    averageRating: number;
    totalReviews: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export default function BarberDashboard() {
    const [status, setStatus] = useState('AVAILABLE');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [barberProfile, setBarberProfile] = useState<BarberProfile | null>(null);
    const [queues, setQueues] = useState<QueueItem[]>([]);
    const [stats, setStats] = useState<BarberStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isCreatingWalkIn, setIsCreatingWalkIn] = useState(false);
    const [showProfileEditor, setShowProfileEditor] = useState(false);
    const [showWalkInModal, setShowWalkInModal] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: '',
        phone: '',
        photoUrl: '',
        specializations: '',
        instagram: '',
        tiktok: '',
        facebook: '',
        whatsapp: '',
        website: ''
    });
    const [walkInForm, setWalkInForm] = useState({
        customerName: '',
        customerPhone: '',
        serviceId: ''
    });
    const [barberServices, setBarberServices] = useState<Service[]>([]);
    const router = useRouter();
    const socketRef = useRef<Socket | null>(null);

    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const waitingQueues = useMemo(
        () => queues.filter((q) => q.status === 'WAITING' || q.status === 'CALLED'),
        [queues]
    );
    const activeQueue = useMemo(
        () => queues.find((q) => q.status === 'IN_PROGRESS') || null,
        [queues]
    );

    const statusColors: Record<string, string> = {
        AVAILABLE: 'bg-green-500',
        BUSY: 'bg-amber-500',
        ON_BREAK: 'bg-blue-500',
        OFFLINE: 'bg-neutral-500'
    };

    const formatTime = (value?: string | null) => {
        if (!value) return '-';
        const date = new Date(value);
        return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date);
    };

    const loadData = useCallback(async () => {
        if (!accessToken) {
            router.replace('/auth/login');
            return;
        }
        try {
            setLoading(true);
            setError('');
            const profileRes = await fetch(`${API_BASE_URL}/users/me`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const profileJson = await profileRes.json();
            if (!profileRes.ok) {
                if (profileRes.status === 401) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    router.replace('/auth/login');
                    return;
                }
                throw new Error(profileJson?.error?.message || 'Gagal memuat profile');
            }

            const user = profileJson.data?.user as UserProfile;
            if (user.role === 'SUPER_ADMIN') {
                router.replace('/super-admin');
                return;
            }
            if (user.role === 'ADMIN') {
                router.replace('/dashboard/admin');
                return;
            }
            setUserProfile(user);

            const [barberRes, statsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/barbers/me`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }),
                fetch(`${API_BASE_URL}/barbers/me/stats`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
            ]);

            const barberJson = await barberRes.json();
            const statsJson = await statsRes.json();

            if (!barberRes.ok) {
                throw new Error(barberJson?.error?.message || 'Gagal memuat profile barber');
            }
            if (!statsRes.ok) {
                throw new Error(statsJson?.error?.message || 'Gagal memuat statistik barber');
            }

            const barber = barberJson.data?.barber as BarberProfile;
            setBarberProfile(barber);
            setStatus(barber.status);
            setProfileForm({
                name: barber.name || '',
                phone: barber.phone || '',
                photoUrl: barber.photoUrl || '',
                specializations: barber.specializations?.join(', ') || '',
                instagram: barber.socialLinks?.instagram || '',
                tiktok: barber.socialLinks?.tiktok || '',
                facebook: barber.socialLinks?.facebook || '',
                whatsapp: barber.socialLinks?.whatsapp || '',
                website: barber.socialLinks?.website || ''
            });

            setStats({
                totalQueues: statsJson.data?.totalQueues || 0,
                completedQueues: statsJson.data?.completedQueues || 0,
                averageRating: statsJson.data?.averageRating || 0,
                totalReviews: statsJson.data?.totalReviews || 0
            });

            const date = new Date().toISOString().split('T')[0];
            const queuesRes = await fetch(`${API_BASE_URL}/barbers/${barber.id}/queues?date=${date}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const queuesJson = await queuesRes.json();
            if (!queuesRes.ok) {
                throw new Error(queuesJson?.error?.message || 'Gagal memuat antrian');
            }
            setQueues(queuesJson.data?.queues || []);

            const servicesRes = await fetch(`${API_BASE_URL}/barbers/${barber.id}/services`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const servicesJson = await servicesRes.json();
            if (servicesRes.ok) {
                setBarberServices(servicesJson.data || []);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal memuat data';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [accessToken, router]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!barberProfile?.id) return;

        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
        }
        const socket = socketRef.current;
        const roomId = `barber:${barberProfile.id}`;

        socket.emit('join-room', roomId);

        const handleRefresh = () => {
            loadData();
        };

        socket.on('queue:new', handleRefresh);
        socket.on('queue:cancelled', handleRefresh);
        socket.on('barber:queue:bulk_updated', handleRefresh);
        socket.on('barber:status_changed', handleRefresh);
        socket.on('queue:status_changed', handleRefresh);

        return () => {
            socket.off('queue:new', handleRefresh);
            socket.off('queue:cancelled', handleRefresh);
            socket.off('barber:queue:bulk_updated', handleRefresh);
            socket.off('barber:status_changed', handleRefresh);
            socket.off('queue:status_changed', handleRefresh);
        };
    }, [barberProfile?.id, loadData]);

    useEffect(() => {
        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, []);

    const updateStatus = async (value: string) => {
        if (!accessToken) return;
        setIsUpdating(true);
        try {
            const response = await fetch(`${API_BASE_URL}/barbers/me/status`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: value })
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error?.message || 'Gagal mengubah status');
            }
            setStatus(payload.data?.status || value);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal mengubah status';
            setError(message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!accessToken) return;
        setError('');
        setIsSavingProfile(true);
        try {
            const payload = {
                name: profileForm.name.trim(),
                phone: profileForm.phone.replace(/[^\d+]/g, ''),
                photoUrl: profileForm.photoUrl.trim() || null,
                specializations: profileForm.specializations
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                socialLinks: {
                    instagram: profileForm.instagram.trim(),
                    tiktok: profileForm.tiktok.trim(),
                    facebook: profileForm.facebook.trim(),
                    whatsapp: profileForm.whatsapp.trim(),
                    website: profileForm.website.trim()
                }
            };

            const response = await fetch(`${API_BASE_URL}/barbers/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });
            const payloadJson = await response.json();
            if (!response.ok) {
                throw new Error(payloadJson?.error?.message || 'Gagal menyimpan profil');
            }
            setShowProfileEditor(false);
            await loadData();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal menyimpan profil';
            setError(message);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleCreateWalkIn = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!accessToken || !barberProfile) return;
        setError('');

        if (!walkInForm.customerName.trim() || !walkInForm.serviceId) {
            setError('Nama pelanggan dan layanan wajib diisi.');
            return;
        }

        setIsCreatingWalkIn(true);
        try {
            const payload = {
                barbershopId: barberProfile.barbershopId,
                barberId: barberProfile.id,
                serviceId: walkInForm.serviceId,
                customerName: walkInForm.customerName.trim(),
                customerPhone: walkInForm.customerPhone.replace(/[^\d+]/g, '') || undefined,
                bookingType: 'WALK_IN',
                scheduledDate: new Date().toISOString()
            };

            const response = await fetch(`${API_BASE_URL}/queues`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });
            const json = await response.json();
            if (!response.ok) {
                throw new Error(json?.error?.message || 'Gagal menambahkan antrian offline');
            }
            setShowWalkInModal(false);
            setWalkInForm({ customerName: '', customerPhone: '', serviceId: '' });
            await loadData();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal menambahkan antrian offline';
            setError(message);
        } finally {
            setIsCreatingWalkIn(false);
        }
    };

    const startService = async (queueId: string) => {
        if (!accessToken) return;
        setIsUpdating(true);
        try {
            const response = await fetch(`${API_BASE_URL}/queues/${queueId}/start`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error?.message || 'Gagal memulai layanan');
            }
            await loadData();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal memulai layanan';
            setError(message);
        } finally {
            setIsUpdating(false);
        }
    };

    const completeService = async (queueId: string) => {
        if (!accessToken) return;
        setIsUpdating(true);
        try {
            const response = await fetch(`${API_BASE_URL}/queues/${queueId}/complete`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error?.message || 'Gagal menyelesaikan layanan');
            }
            await loadData();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal menyelesaikan layanan';
            setError(message);
        } finally {
            setIsUpdating(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.replace('/auth/login');
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30">
            {/* Sidebar/Nav Placeholder for Mobile */}
            <nav className="p-6 flex items-center justify-between border-b border-white/5 bg-neutral-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl rotate-12 flex items-center justify-center font-bold text-black border-2 border-white/10">M</div>
                    <div>
                        <h1 className="text-sm font-black tracking-tight leading-none uppercase">Barber Station</h1>
                        <p className="text-[10px] text-neutral-500 font-bold tracking-tighter uppercase">
                            {userProfile?.fullName || 'Barber'} • {userProfile?.barbershop?.name || 'Barbershop'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse`} />
                    <select
                        value={status}
                        onChange={(e) => updateStatus(e.target.value)}
                        className="bg-transparent text-xs font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
                    >
                        <option value="AVAILABLE" className="bg-neutral-900">Available</option>
                        <option value="BUSY" disabled className="bg-neutral-900">Busy</option>
                        <option value="ON_BREAK" className="bg-neutral-900">On Break</option>
                        <option value="OFFLINE" className="bg-neutral-900">Offline</option>
                    </select>
                </div>
            </nav>

            <main className="p-6 max-w-5xl mx-auto grid md:grid-cols-12 gap-6">
                {error && (
                    <div className="md:col-span-12 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300">
                        {error}
                    </div>
                )}
                {loading && (
                    <div className="md:col-span-12 rounded-2xl border border-white/5 bg-neutral-900/40 p-6 text-center text-neutral-400">
                        Memuat data...
                    </div>
                )}
                {/* Active Session */}
                <div className="md:col-span-8 space-y-6">
                    <section className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Current Session</h3>
                        <div className="bg-neutral-900/60 border-2 border-amber-500/20 rounded-[2rem] p-8 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                                <Scissors size={180} />
                            </div>

                            {activeQueue ? (
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase">In Progress</span>
                                            <h2 className="text-4xl font-black tracking-tight">
                                                {activeQueue.customer?.fullName || activeQueue.customerName || 'Guest'}
                                            </h2>
                                            <p className="text-neutral-400 font-medium">
                                                {activeQueue.service?.name || 'Service'} • Estimasi mulai {formatTime(activeQueue.estimatedStart)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Est. End</p>
                                            <p className="text-xl font-black">{formatTime(activeQueue.estimatedEnd)}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => completeService(activeQueue.id)}
                                            disabled={isUpdating}
                                            className="flex-1 bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all"
                                        >
                                            <CheckCircle size={20} /> Finish Service
                                        </button>
                                        <button
                                            className="px-6 rounded-2xl bg-neutral-800 border border-white/5 hover:bg-neutral-700 transition-colors"
                                            onClick={() => updateStatus('ON_BREAK')}
                                            disabled={isUpdating}
                                        >
                                            <PauseCircle size={20} className="text-neutral-400" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 rounded-3xl bg-neutral-800 flex items-center justify-center text-neutral-500">
                                        <Play size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold">No Active Session</h3>
                                        <p className="text-xs text-neutral-500 max-w-[200px]">Call the next person in line to begin their transformation.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Queue List */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Waiting List</h3>
                            <span className="bg-neutral-900 border border-white/5 text-[10px] font-black px-2 py-1 rounded-lg">
                                {waitingQueues.length} Customers
                            </span>
                        </div>

                        <div className="space-y-3">
                            {waitingQueues.map((q) => (
                                <div
                                    key={q.id}
                                    className="bg-neutral-900/40 border border-white/5 p-5 rounded-2xl flex items-center justify-between hover:bg-neutral-900/60 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 font-bold">
                                            {q.customerName === 'Guest User' ? <Users size={18} /> : (q.customer?.fullName || q.customerName || 'G')[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm tracking-tight">
                                                {q.customer?.fullName || q.customerName || 'Guest'}
                                            </h4>
                                            <p className="text-[10px] text-neutral-500 font-bold uppercase">{q.service?.name || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Wait</p>
                                            <p className="text-xs font-black">{formatTime(q.estimatedStart)}</p>
                                        </div>
                                        <button
                                            onClick={() => startService(q.id)}
                                            disabled={!!activeQueue || isUpdating}
                                            className="p-3 bg-neutral-800 group-hover:bg-amber-500 group-hover:text-black rounded-xl transition-all"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {waitingQueues.length === 0 && (
                                <div className="rounded-2xl border border-white/5 bg-neutral-900/40 p-6 text-sm text-neutral-400">
                                    Belum ada antrian menunggu.
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Info */}
                <div className="md:col-span-4 space-y-6">
                    <section className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Shop Performance</h3>
                        <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-6 space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-neutral-500">
                                    <span>Today's Total</span>
                                    <span>{stats ? `${stats.completedQueues}/${stats.totalQueues}` : '0/0'}</span>
                                </div>
                                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 rounded-full"
                                        style={{
                                            width: stats && stats.totalQueues > 0
                                                ? `${Math.min(100, Math.round((stats.completedQueues / stats.totalQueues) * 100))}%`
                                                : '0%'
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-2xl font-black">{stats ? stats.averageRating.toFixed(1) : '0.0'}</p>
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase">Avg Rating</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black">{stats ? stats.totalReviews : 0}</p>
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase">Total Reviews</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowWalkInModal(true)}
                                className="bg-neutral-900 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors"
                            >
                                <Scissors size={18} className="text-amber-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Walk-in</span>
                            </button>
                            <button
                                onClick={() => setShowProfileEditor(true)}
                                className="bg-neutral-900 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors"
                            >
                                <User size={18} className="text-blue-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Profil</span>
                            </button>
                            <button
                                onClick={() => updateStatus('OFFLINE')}
                                disabled={isUpdating}
                                className="bg-neutral-900 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors"
                            >
                                <Moon size={18} className="text-blue-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest">End Day</span>
                            </button>
                            <button
                                onClick={logout}
                                className="bg-neutral-900 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors text-red-500"
                            >
                                <Power size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                            </button>
                        </div>
                    </section>
                    <button
                        onClick={loadData}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition"
                    >
                        <RefreshCw size={14} /> Refresh Data
                    </button>
                </div>
            </main>
            {showProfileEditor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
                    <div className="w-full max-w-2xl rounded-[2.5rem] border border-white/10 bg-neutral-900/90 p-8 space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Profil Barber</p>
                                <h3 className="text-2xl font-black">Update Data Diri</h3>
                            </div>
                            <button
                                onClick={() => setShowProfileEditor(false)}
                                className="text-neutral-500 text-xs font-bold uppercase tracking-widest hover:text-white"
                            >
                                Tutup
                            </button>
                        </div>
                        <form className="space-y-4" onSubmit={handleSaveProfile}>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                    placeholder="Nama"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                />
                                <input
                                    type="tel"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                    placeholder="No. HP"
                                    value={profileForm.phone}
                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                />
                                <input
                                    type="url"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium md:col-span-2"
                                    placeholder="Photo URL"
                                    value={profileForm.photoUrl}
                                    onChange={(e) => setProfileForm({ ...profileForm, photoUrl: e.target.value })}
                                />
                            </div>
                            <input
                                type="text"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                placeholder="Spesialisasi (pisahkan dengan koma)"
                                value={profileForm.specializations}
                                onChange={(e) => setProfileForm({ ...profileForm, specializations: e.target.value })}
                            />
                            <div className="grid md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                    placeholder="Instagram"
                                    value={profileForm.instagram}
                                    onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                    placeholder="TikTok"
                                    value={profileForm.tiktok}
                                    onChange={(e) => setProfileForm({ ...profileForm, tiktok: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                    placeholder="Facebook"
                                    value={profileForm.facebook}
                                    onChange={(e) => setProfileForm({ ...profileForm, facebook: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                    placeholder="WhatsApp"
                                    value={profileForm.whatsapp}
                                    onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium md:col-span-2"
                                    placeholder="Website"
                                    value={profileForm.website}
                                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSavingProfile}
                                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-70 text-black font-black py-4 rounded-2xl transition-all"
                            >
                                {isSavingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {showWalkInModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
                    <div className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-neutral-900/90 p-8 space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Walk-in</p>
                                <h3 className="text-2xl font-black">Input Pelanggan Offline</h3>
                            </div>
                            <button
                                onClick={() => setShowWalkInModal(false)}
                                className="text-neutral-500 text-xs font-bold uppercase tracking-widest hover:text-white"
                            >
                                Tutup
                            </button>
                        </div>
                        <form className="space-y-4" onSubmit={handleCreateWalkIn}>
                            <input
                                type="text"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                placeholder="Nama pelanggan"
                                value={walkInForm.customerName}
                                onChange={(e) => setWalkInForm({ ...walkInForm, customerName: e.target.value })}
                            />
                            <input
                                type="tel"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                placeholder="No. HP (opsional)"
                                value={walkInForm.customerPhone}
                                onChange={(e) => setWalkInForm({ ...walkInForm, customerPhone: e.target.value })}
                            />
                            <select
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                value={walkInForm.serviceId}
                                onChange={(e) => setWalkInForm({ ...walkInForm, serviceId: e.target.value })}
                            >
                                <option value="">Pilih layanan</option>
                                {barberServices.map((service) => (
                                    <option key={service.id} value={service.id}>
                                        {service.name} ({service.duration}m)
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                disabled={isCreatingWalkIn}
                                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-70 text-black font-black py-4 rounded-2xl transition-all"
                            >
                                {isCreatingWalkIn ? 'Menyimpan...' : 'Tambah Antrian'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
