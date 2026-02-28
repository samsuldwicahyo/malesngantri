"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    Clock,
    MapPin,
    PhoneCall,
    RefreshCw,
    Users
} from 'lucide-react';

type Barbershop = {
    id: string;
    name: string;
    slug: string;
    address?: string | null;
    averageRating?: number;
};

type CustomerProfile = {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    role: string;
    phoneVerified?: boolean;
    phoneVerifiedAt?: string | null;
};

type QueueStatus = {
    id: string;
    queueNumber: string;
    position: number;
    status: string;
    estimatedStart: string | null;
    estimatedEnd: string | null;
    barbershop: { id: string; name: string; slug: string; address?: string | null };
    barber: { id: string; name: string };
    service: { id: string; name: string; duration: number };
};

type QueuePayload = {
    queue: QueueStatus;
    activeQueueNumber: string | null;
    aheadCount: number;
    estimatedWaitMinutes: number | null;
    phone: string;
};

type AccountQueue = {
    id: string;
    queueNumber: string;
    status: string;
    positionInQueue: number;
    remainingMinutes: number;
    estimatedStart?: string | null;
    estimatedEnd?: string | null;
    barbershop?: { name: string; address?: string | null; phoneNumber?: string | null; slug?: string | null };
    barber?: { name: string };
    service?: { name: string; duration: number };
};

type HistoryItem = {
    id: string;
    status: string;
    scheduledDate?: string | null;
    barbershop?: { name?: string; slug?: string | null };
    barber?: { name?: string };
    service?: { name?: string };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

const statusLabels: Record<string, string> = {
    WAITING: 'Menunggu',
    CALLED: 'Dipanggil',
    IN_PROGRESS: 'Sedang Dilayani',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    NO_SHOW: 'Tidak Hadir',
    SKIPPED: 'Dilewati'
};

const statusColors: Record<string, string> = {
    WAITING: 'bg-amber-500/10 text-amber-400',
    CALLED: 'bg-amber-500/10 text-amber-400',
    IN_PROGRESS: 'bg-emerald-500/10 text-emerald-400',
    COMPLETED: 'bg-blue-500/10 text-blue-400',
    CANCELLED: 'bg-red-500/10 text-red-400',
    NO_SHOW: 'bg-red-500/10 text-red-400',
    SKIPPED: 'bg-neutral-500/10 text-neutral-400'
};

export default function CustomerDashboardPage() {
    const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
    const [queues, setQueues] = useState<QueuePayload[]>([]);
    const [loadingQueues, setLoadingQueues] = useState(true);
    const [loadingShops, setLoadingShops] = useState(true);
    const [error, setError] = useState('');
    const [isCancelling, setIsCancelling] = useState<string | null>(null);
    const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
    const [accountQueue, setAccountQueue] = useState<AccountQueue | null>(null);
    const [accountHistory, setAccountHistory] = useState<HistoryItem[]>([]);
    const [loadingAccount, setLoadingAccount] = useState(false);
    const [accountNotice, setAccountNotice] = useState('');
    const [profileForm, setProfileForm] = useState({ fullName: '', email: '', phoneNumber: '' });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isRequestingOtp, setIsRequestingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const activeQueues = useMemo(
        () => queues.filter((q) => ['WAITING', 'CALLED', 'IN_PROGRESS'].includes(q.queue.status)),
        [queues]
    );
    const historyQueues = useMemo(
        () => queues.filter((q) => !['WAITING', 'CALLED', 'IN_PROGRESS'].includes(q.queue.status)),
        [queues]
    );

    const formatTime = (value?: string | null) => {
        if (!value) return '-';
        const date = new Date(value);
        return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date);
    };

    const refreshQueues = async () => {
        if (typeof window === 'undefined') return;
        setLoadingQueues(true);
        setError('');

        const keys = Object.keys(localStorage).filter((key) => key.startsWith('queue:'));
        const stored = keys
            .map((key) => {
                try {
                    return { key, value: JSON.parse(localStorage.getItem(key) || '{}') };
                } catch {
                    return { key, value: null };
                }
            })
            .filter((item) => item.value?.queueId && item.value?.phone);

        const results: QueuePayload[] = [];

        await Promise.all(
            stored.map(async ({ key, value }) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/queues/public/${value.queueId}?phone=${encodeURIComponent(value.phone)}`);
                    if (!response.ok) {
                        if (response.status === 404) {
                            localStorage.removeItem(key);
                        }
                        return;
                    }
                    const payload = await response.json();
                    results.push({ ...payload.data, phone: value.phone });
                } catch {
                    return;
                }
            })
        );

        setQueues(results);
        setLoadingQueues(false);
    };

    useEffect(() => {
        refreshQueues();
    }, []);

    const refreshAccount = async () => {
        if (!accessToken) {
            setCustomerProfile(null);
            setAccountQueue(null);
            setAccountHistory([]);
            setAccountNotice('');
            return;
        }
        try {
            setLoadingAccount(true);
            setAccountNotice('');
            const profileRes = await fetch(`${API_BASE_URL}/users/me`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const profileJson = await profileRes.json();
            if (!profileRes.ok) {
                throw new Error(profileJson?.error?.message || 'Gagal memuat profile');
            }

            const user = profileJson.data?.user as CustomerProfile;
            setCustomerProfile(user);
            setProfileForm({
                fullName: user.fullName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || ''
            });

            if (user.role !== 'CUSTOMER') {
                setAccountNotice(`Anda login sebagai ${user.role}.`);
                setAccountQueue(null);
                setAccountHistory([]);
                return;
            }

            const [queueRes, historyRes] = await Promise.all([
                fetch(`${API_BASE_URL}/queues/my-queue`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }),
                fetch(`${API_BASE_URL}/queues/history`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
            ]);

            const queueJson = await queueRes.json();
            const historyJson = await historyRes.json();

            if (queueRes.ok) {
                setAccountQueue(queueJson.data || null);
            }
            if (historyRes.ok) {
                setAccountHistory(historyJson.data || []);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal memuat akun';
            setAccountNotice(message);
        } finally {
            setLoadingAccount(false);
        }
    };

    useEffect(() => {
        const loadShops = async () => {
            try {
                setLoadingShops(true);
                const response = await fetch(`${API_BASE_URL}/barbershops`);
                const payload = await response.json();
                if (!response.ok) {
                    throw new Error(payload?.error?.message || 'Gagal memuat barbershop');
                }
                setBarbershops(payload.data || []);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Gagal memuat data';
                setError(message);
            } finally {
                setLoadingShops(false);
            }
        };

        loadShops();
    }, []);

    useEffect(() => {
        refreshAccount();
    }, [accessToken]);

    const handleCancel = async (queue: QueuePayload) => {
        setIsCancelling(queue.queue.id);
        try {
            const response = await fetch(`${API_BASE_URL}/queues/public/${queue.queue.id}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerPhone: queue.phone,
                    cancelReason: 'Dibatalkan oleh customer'
                })
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error?.message || 'Gagal membatalkan antrian');
            }
            await refreshQueues();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal membatalkan antrian';
            setError(message);
        } finally {
            setIsCancelling(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setCustomerProfile(null);
        setAccountQueue(null);
        setAccountHistory([]);
        setAccountNotice('');
    };

    const handleProfileChange = (field: keyof typeof profileForm, value: string) => {
        setProfileForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        if (!accessToken) return;
        setIsSavingProfile(true);
        setAccountNotice('');
        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName: profileForm.fullName.trim(),
                    email: profileForm.email.trim(),
                    phoneNumber: profileForm.phoneNumber.trim()
                })
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error?.message || 'Gagal menyimpan profil');
            }
            if (payload?.data?.user) {
                localStorage.setItem('user', JSON.stringify(payload.data.user));
                setCustomerProfile((prev) => prev ? { ...prev, ...payload.data.user } : payload.data.user);
            }
            setAccountNotice('Profil berhasil diperbarui.');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal menyimpan profil';
            setAccountNotice(message);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleRequestOtp = async () => {
        if (!accessToken) return;
        setIsRequestingOtp(true);
        setAccountNotice('');
        try {
            const response = await fetch(`${API_BASE_URL}/auth/otp/request`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error?.message || 'Gagal mengirim OTP');
            }
            setAccountNotice('OTP sudah dikirim. Cek console backend (dev).');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal mengirim OTP';
            setAccountNotice(message);
        } finally {
            setIsRequestingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!accessToken || !otpCode.trim()) return;
        setIsVerifyingOtp(true);
        setAccountNotice('');
        try {
            const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: otpCode.trim() })
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error?.message || 'OTP salah/expired');
            }
            setOtpCode('');
            await refreshAccount();
            setAccountNotice('Nomor WhatsApp berhasil diverifikasi.');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'OTP salah/expired';
            setAccountNotice(message);
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleChangePassword = async () => {
        if (!accessToken) return;
        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            setAccountNotice('Password lama dan baru wajib diisi.');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setAccountNotice('Konfirmasi password tidak sama.');
            return;
        }
        setIsChangingPassword(true);
        setAccountNotice('');
        try {
            const response = await fetch(`${API_BASE_URL}/users/me/password`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error?.message || 'Gagal ganti password');
            }
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setAccountNotice('Password berhasil diperbarui.');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal ganti password';
            setAccountNotice(message);
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30">
            <header className="border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-amber-500 font-black">Customer</p>
                        <h1 className="text-2xl font-black tracking-tight">Dashboard Antrian</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={refreshQueues}
                            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition"
                        >
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <Link
                            href="/"
                            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition"
                        >
                            Ke Beranda
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
                {error && (
                    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300">
                        {error}
                    </div>
                )}

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black">Akun Customer</h2>
                        {customerProfile && (
                            <button
                                onClick={refreshAccount}
                                className="text-xs font-bold uppercase tracking-widest text-amber-500"
                            >
                                Refresh Akun
                            </button>
                        )}
                    </div>

                    {!accessToken && (
                        <div className="rounded-[2rem] border border-white/5 bg-neutral-900/60 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold">Login untuk lihat riwayat dan profil.</p>
                                <p className="text-xs text-neutral-400">Customer login akan menyimpan semua antrian kamu.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/auth/login"
                                    className="rounded-2xl bg-amber-500 text-black font-black px-6 py-3 text-sm text-center hover:bg-amber-400"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/customer/register"
                                    className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-neutral-200 text-center hover:bg-white/10"
                                >
                                    Daftar Akun
                                </Link>
                            </div>
                        </div>
                    )}

                    {loadingAccount && (
                        <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-6 text-center text-neutral-400">
                            Memuat akun...
                        </div>
                    )}

                    {customerProfile && (
                        <div className="rounded-[2rem] border border-white/5 bg-neutral-900/60 p-6 space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Profil</p>
                                    <p className="text-lg font-black">{customerProfile.fullName}</p>
                                    <p className="text-sm text-neutral-400">{customerProfile.email}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {customerProfile.role !== 'CUSTOMER' && (
                                        <Link
                                            href={customerProfile.role === 'ADMIN' ? '/dashboard/admin' : customerProfile.role === 'BARBER' ? '/dashboard/barber' : '/super-admin'}
                                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10"
                                        >
                                            Ke Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-300 hover:bg-red-500/20"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Nama</label>
                                    <input
                                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                        value={profileForm.fullName}
                                        onChange={(e) => handleProfileChange('fullName', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Email</label>
                                    <input
                                        type="email"
                                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                        value={profileForm.email}
                                        onChange={(e) => handleProfileChange('email', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">WhatsApp</label>
                                    <input
                                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                        value={profileForm.phoneNumber}
                                        onChange={(e) => handleProfileChange('phoneNumber', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="text-xs text-neutral-400">
                                    Status WA:{' '}
                                    {customerProfile.phoneVerified ? (
                                        <span className="text-emerald-400 font-bold">Terverifikasi</span>
                                    ) : (
                                        <span className="text-amber-400 font-bold">Belum verifikasi</span>
                                    )}
                                </div>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                    className="rounded-2xl bg-amber-500 text-black font-black px-6 py-3 text-xs uppercase tracking-widest hover:bg-amber-400 disabled:opacity-70"
                                >
                                    {isSavingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                                </button>
                            </div>

                            <div className="rounded-2xl border border-white/5 bg-black/20 p-4 space-y-3">
                                <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Verifikasi WhatsApp</p>
                                <div className="flex flex-col md:flex-row gap-3">
                                    <button
                                        onClick={handleRequestOtp}
                                        disabled={isRequestingOtp}
                                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10"
                                    >
                                        {isRequestingOtp ? 'Mengirim...' : 'Kirim OTP'}
                                    </button>
                                    <input
                                        placeholder="Kode OTP"
                                        className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                    />
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={isVerifyingOtp}
                                        className="rounded-2xl bg-emerald-500 text-black font-black px-4 py-2 text-xs uppercase tracking-widest hover:bg-emerald-400 disabled:opacity-70"
                                    >
                                        {isVerifyingOtp ? 'Memverifikasi...' : 'Verifikasi'}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/5 bg-black/20 p-4 space-y-3">
                                <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Ganti Password</p>
                                <div className="grid md:grid-cols-3 gap-3">
                                    <input
                                        type="password"
                                        placeholder="Password lama"
                                        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password baru"
                                        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Konfirmasi password"
                                        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                    />
                                </div>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={isChangingPassword}
                                    className="rounded-2xl bg-white/10 text-white font-bold px-4 py-2 text-xs uppercase tracking-widest hover:bg-white/20 disabled:opacity-70"
                                >
                                    {isChangingPassword ? 'Menyimpan...' : 'Update Password'}
                                </button>
                            </div>

                            {accountNotice && (
                                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-200">
                                    {accountNotice}
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {customerProfile?.role === 'CUSTOMER' && (
                    <>
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black">Antrian Akun</h2>
                                <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
                                    {accountQueue ? 'Aktif' : 'Kosong'}
                                </span>
                            </div>

                            {!accountQueue ? (
                                <div className="rounded-3xl border border-white/5 bg-neutral-900/60 p-10 text-center text-neutral-400">
                                    Belum ada antrian aktif untuk akun kamu.
                                </div>
                            ) : (
                                <div className="rounded-[2rem] border border-white/5 bg-neutral-900/60 p-6 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Nomor Antrian</p>
                                            <p className="text-3xl font-black text-amber-400">{accountQueue.queueNumber}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${statusColors[accountQueue.status]}`}>
                                            {statusLabels[accountQueue.status] || accountQueue.status}
                                        </span>
                                    </div>

                                    <div className="text-sm text-neutral-300 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} />
                                            <span>{accountQueue.barbershop?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={14} />
                                            <span>{accountQueue.barber?.name || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            <span>Estimasi mulai {formatTime(accountQueue.estimatedStart)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                                            <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Posisi</p>
                                            <p className="text-xl font-black">{accountQueue.positionInQueue}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                                            <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Estimasi tunggu</p>
                                            <p className="text-xl font-black">~{accountQueue.remainingMinutes}m</p>
                                        </div>
                                    </div>

                                    {accountQueue.barbershop?.slug && (
                                        <Link
                                            href={`/${accountQueue.barbershop.slug}/queue`}
                                            className="inline-flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest"
                                        >
                                            Lihat Detail <ArrowRight size={14} />
                                        </Link>
                                    )}
                                </div>
                            )}
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black">Riwayat Akun</h2>
                                <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
                                    {accountHistory.length} riwayat
                                </span>
                            </div>

                            {accountHistory.length === 0 ? (
                                <div className="rounded-3xl border border-white/5 bg-neutral-900/60 p-10 text-center text-neutral-400">
                                    Riwayat akun belum tersedia.
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {accountHistory.map((item) => (
                                        <div key={item.id} className="rounded-[2rem] border border-white/5 bg-neutral-900/60 p-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-lg font-black">{item.barbershop?.name || '-'}</p>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${statusColors[item.status]}`}>
                                                    {statusLabels[item.status] || item.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-neutral-400">
                                                {item.barber?.name || '-'} • {item.service?.name || '-'}
                                            </div>
                                            {item.barbershop?.slug && (
                                                <Link
                                                    href={`/${item.barbershop.slug}/queue`}
                                                    className="inline-flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest"
                                                >
                                                    Lihat Detail <ArrowRight size={14} />
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black">Antrian Guest</h2>
                        <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
                            {activeQueues.length} aktif
                        </span>
                    </div>

                    {loadingQueues ? (
                        <div className="rounded-3xl border border-white/5 bg-neutral-900/60 p-10 text-center text-neutral-400">
                            Memuat antrian...
                        </div>
                    ) : activeQueues.length === 0 ? (
                        <div className="rounded-3xl border border-white/5 bg-neutral-900/60 p-10 text-center text-neutral-400">
                            Belum ada antrian aktif.
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {activeQueues.map((item) => (
                                <div key={item.queue.id} className="rounded-[2rem] border border-white/5 bg-neutral-900/60 p-6 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Nomor Antrian</p>
                                            <p className="text-3xl font-black text-amber-400">{item.queue.queueNumber}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${statusColors[item.queue.status]}`}>
                                            {statusLabels[item.queue.status] || item.queue.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-neutral-300">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} />
                                            <span>{item.queue.barbershop?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={14} />
                                            <span>{item.queue.barber?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            <span>Estimasi mulai {formatTime(item.queue.estimatedStart)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                                            <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Antrian di depan</p>
                                            <p className="text-xl font-black">{item.aheadCount}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                                            <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Estimasi tunggu</p>
                                            <p className="text-xl font-black">{item.estimatedWaitMinutes != null ? `~${item.estimatedWaitMinutes}m` : '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Link
                                            href={`/${item.queue.barbershop?.slug || ''}/queue`}
                                            className="flex-1 rounded-2xl bg-amber-500 text-black font-black py-3 text-center text-sm transition hover:bg-amber-400"
                                        >
                                            Lihat Detail
                                        </Link>
                                        <button
                                            onClick={() => handleCancel(item)}
                                            disabled={isCancelling === item.queue.id}
                                            className="flex-1 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 font-bold py-3 text-sm transition hover:bg-red-500/20 disabled:opacity-60"
                                        >
                                            {isCancelling === item.queue.id ? 'Membatalkan...' : 'Batalkan'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black">Riwayat Terakhir</h2>
                        <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
                            {historyQueues.length} riwayat
                        </span>
                    </div>
                    {historyQueues.length === 0 ? (
                        <div className="rounded-3xl border border-white/5 bg-neutral-900/60 p-10 text-center text-neutral-400">
                            Riwayat antrian belum tersedia.
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {historyQueues.map((item) => (
                                <div key={item.queue.id} className="rounded-[2rem] border border-white/5 bg-neutral-900/60 p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg font-black">{item.queue.queueNumber}</p>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${statusColors[item.queue.status]}`}>
                                            {statusLabels[item.queue.status] || item.queue.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-neutral-400">
                                        {item.queue.barbershop?.name} • {item.queue.barber?.name}
                                    </div>
                                    <Link
                                        href={`/${item.queue.barbershop?.slug || ''}/queue`}
                                        className="inline-flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest"
                                    >
                                        Lihat Detail <ArrowRight size={14} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black">Cari Barbershop</h2>
                        <Link href="/#explore" className="text-xs font-bold uppercase tracking-widest text-amber-500">
                            Lihat Semua
                        </Link>
                    </div>

                    {loadingShops ? (
                        <div className="rounded-3xl border border-white/5 bg-neutral-900/60 p-10 text-center text-neutral-400">
                            Memuat barbershop...
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-4">
                            {barbershops.slice(0, 3).map((shop) => (
                                <Link
                                    key={shop.id}
                                    href={`/${shop.slug}`}
                                    className="group rounded-[2rem] border border-white/5 bg-neutral-900/60 p-5 transition hover:border-white/10"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">{shop.slug}</p>
                                            <p className="text-lg font-black">{shop.name}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black">
                                            {shop.name[0]}
                                        </div>
                                    </div>
                                    <div className="mt-4 text-sm text-neutral-400 flex items-center gap-2">
                                        <MapPin size={14} /> {shop.address || '-'}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <section className="rounded-[2rem] border border-white/5 bg-neutral-900/60 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-black">Butuh bantuan?</h3>
                        <p className="text-sm text-neutral-400">Hubungi admin barbershop jika ada kendala pada antrian.</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-300">
                        <PhoneCall size={16} />
                        Nomor WhatsApp tersimpan di saat kamu masuk antrian.
                    </div>
                </section>
            </main>
        </div>
    );
}
