"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Users,
    Settings,
    BarChart3,
    Plus,
    ClipboardList,
    Scissors,
    MoreVertical,
    Edit2,
    Trash2
} from 'lucide-react';

type UserProfile = {
    id: string;
    fullName: string;
    email: string;
    role: string;
    barbershopId?: string | null;
    barbershop?: { id: string; name: string };
};

type Stats = {
    barbersCount: number;
    servicesCount: number;
    customersCount: number;
    queuesCount: number;
};

type Barber = {
    id: string;
    name: string;
    status: string;
    averageRating: number;
    services?: Service[];
};

type Service = {
    id: string;
    name: string;
    price: number;
    duration: number;
};

type SocialLinks = {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    whatsapp?: string;
    website?: string;
};

type Barbershop = {
    id: string;
    name: string;
    slug: string;
    address?: string | null;
    phoneNumber?: string | null;
    openingTime?: string | null;
    closingTime?: string | null;
    logoUrl?: string | null;
    description?: string | null;
    socialLinks?: SocialLinks | null;
};

type QueueItem = {
    id: string;
    queueNumber: string;
    status: string;
    customerName?: string | null;
    updatedAt: string;
    barber?: { id: string; name: string };
    service?: { id: string; name: string };
    customer?: { fullName?: string | null };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [shop, setShop] = useState<Barbershop | null>(null);
    const [queues, setQueues] = useState<QueueItem[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddBarber, setShowAddBarber] = useState(false);
    const [showAddService, setShowAddService] = useState(false);
    const [isCreatingBarber, setIsCreatingBarber] = useState(false);
    const [isCreatingService, setIsCreatingService] = useState(false);
    const [isSavingShop, setIsSavingShop] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState<{
        email: string;
        password: string;
        name: string;
        username?: string;
    } | null>(null);
    const [barberForm, setBarberForm] = useState({
        name: '',
        phone: '',
        email: '',
        photoUrl: '',
        specializations: '',
        experienceYears: 0,
        commissionRate: 30,
        workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
        startTime: '09:00',
        endTime: '18:00',
        serviceIds: [] as string[]
    });
    const [serviceForm, setServiceForm] = useState({
        name: '',
        description: '',
        price: 0,
        duration: 30
    });
    const [shopForm, setShopForm] = useState({
        name: '',
        slug: '',
        address: '',
        logoUrl: '',
        description: '',
        openingTime: '09:00',
        closingTime: '18:00',
        instagram: '',
        tiktok: '',
        facebook: '',
        whatsapp: '',
        website: ''
    });
    const router = useRouter();
    const searchParams = useSearchParams();

    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const dayOptions = [
        { label: 'Mon', value: 'MONDAY', dayOfWeek: 1 },
        { label: 'Tue', value: 'TUESDAY', dayOfWeek: 2 },
        { label: 'Wed', value: 'WEDNESDAY', dayOfWeek: 3 },
        { label: 'Thu', value: 'THURSDAY', dayOfWeek: 4 },
        { label: 'Fri', value: 'FRIDAY', dayOfWeek: 5 },
        { label: 'Sat', value: 'SATURDAY', dayOfWeek: 6 },
        { label: 'Sun', value: 'SUNDAY', dayOfWeek: 0 }
    ];

    const buildSchedule = () => {
        return dayOptions
            .filter((day) => barberForm.workingDays.includes(day.value))
            .map((day) => ({
                dayOfWeek: day.dayOfWeek,
                startTime: barberForm.startTime,
                endTime: barberForm.endTime,
                isWorkDay: true
            }));
    };

    const parseSpecializations = () => {
        if (!barberForm.specializations.trim()) return [];
        return barberForm.specializations
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    };

    const statCards = useMemo(() => {
        if (!stats) {
            return [];
        }
        return [
            {
                label: 'Total Barbers',
                value: stats.barbersCount.toString(),
                icon: <Scissors size={20} className="text-emerald-500" />
            },
            {
                label: 'Total Services',
                value: stats.servicesCount.toString(),
                icon: <Scissors size={20} className="text-blue-500" />
            },
            {
                label: 'Total Customers',
                value: stats.customersCount.toString(),
                icon: <Users size={20} className="text-amber-500" />
            },
            {
                label: 'Total Queues',
                value: stats.queuesCount.toString(),
                icon: <BarChart3 size={20} className="text-purple-500" />
            }
        ];
    }, [stats]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (!tab) return;
        const allowed = new Set(['overview', 'barbers', 'services', 'settings']);
        if (allowed.has(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const barberQueueCounts = useMemo(() => {
        const activeStatuses = new Set(['WAITING', 'CALLED', 'IN_PROGRESS']);
        const counts: Record<string, number> = {};
        queues.forEach((q) => {
            if (!activeStatuses.has(q.status)) return;
            if (!q.barber?.id) return;
            counts[q.barber.id] = (counts[q.barber.id] || 0) + 1;
        });
        return counts;
    }, [queues]);

    const recentQueues = useMemo(() => {
        return [...queues]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);
    }, [queues]);

    const load = useCallback(async () => {
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
            if (user.role === 'BARBER') {
                router.replace('/dashboard/barber');
                return;
            }
            if (!user.barbershopId) {
                throw new Error('Barbershop tidak ditemukan untuk admin');
            }

            setProfile(user);

            const date = new Date().toISOString().split('T')[0];
            const [statsRes, barbersRes, queuesRes, servicesRes, shopRes] = await Promise.all([
                fetch(`${API_BASE_URL}/barbershops/${user.barbershopId}/stats`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }),
                fetch(`${API_BASE_URL}/barbershops/${user.barbershopId}/barbers`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }),
                fetch(`${API_BASE_URL}/barbershops/${user.barbershopId}/queues?date=${date}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }),
                fetch(`${API_BASE_URL}/barbershops/${user.barbershopId}/services`),
                fetch(`${API_BASE_URL}/barbershops/${user.barbershopId}`)
            ]);

            const statsJson = await statsRes.json();
            const barbersJson = await barbersRes.json();
            const queuesJson = await queuesRes.json();
            const servicesJson = await servicesRes.json();
            const shopJson = await shopRes.json();

            if (!statsRes.ok) {
                throw new Error(statsJson?.error?.message || 'Gagal memuat statistik');
            }
            if (!barbersRes.ok) {
                throw new Error(barbersJson?.error?.message || 'Gagal memuat barber');
            }
            if (!queuesRes.ok) {
                throw new Error(queuesJson?.error?.message || 'Gagal memuat antrian');
            }
            if (!servicesRes.ok) {
                throw new Error(servicesJson?.error?.message || 'Gagal memuat layanan');
            }
            if (!shopRes.ok) {
                throw new Error(shopJson?.error?.message || 'Gagal memuat barbershop');
            }

            setStats({
                barbersCount: statsJson.data?.barbersCount || 0,
                servicesCount: statsJson.data?.servicesCount || 0,
                customersCount: statsJson.data?.customersCount || 0,
                queuesCount: statsJson.data?.queuesCount || 0
            });

            const barberData = barbersJson.data?.barbers || [];
            setBarbers(
                barberData.map((b: any) => ({
                    id: b.id,
                    name: b.name,
                    status: b.status,
                    averageRating: b.averageRating || 0,
                    services: b.services?.map((item: any) => item.service) || []
                }))
            );

            setQueues(queuesJson.data || []);
            setServices(servicesJson.data || []);
            setShop(shopJson.data || null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal memuat data';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [accessToken, router]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!shop) return;
        setShopForm({
            name: shop.name || '',
            slug: shop.slug || '',
            address: shop.address || '',
            logoUrl: shop.logoUrl || '',
            description: shop.description || '',
            openingTime: shop.openingTime || '09:00',
            closingTime: shop.closingTime || '18:00',
            instagram: shop.socialLinks?.instagram || '',
            tiktok: shop.socialLinks?.tiktok || '',
            facebook: shop.socialLinks?.facebook || '',
            whatsapp: shop.socialLinks?.whatsapp || '',
            website: shop.socialLinks?.website || ''
        });
    }, [shop]);

    const toggleWorkingDay = (day: string) => {
        setBarberForm((prev) => ({
            ...prev,
            workingDays: prev.workingDays.includes(day)
                ? prev.workingDays.filter((d) => d !== day)
                : [...prev.workingDays, day]
        }));
    };

    const toggleServiceSelection = (serviceId: string) => {
        setBarberForm((prev) => ({
            ...prev,
            serviceIds: prev.serviceIds.includes(serviceId)
                ? prev.serviceIds.filter((id) => id !== serviceId)
                : [...prev.serviceIds, serviceId]
        }));
    };

    const handleCreateBarber = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!accessToken) return;
        setError('');
        if (!barberForm.name.trim() || !barberForm.phone.trim()) {
            setError('Nama dan nomor telepon barber wajib diisi.');
            return;
        }

        setIsCreatingBarber(true);
        try {
            const payload = {
                name: barberForm.name.trim(),
                phone: barberForm.phone.replace(/[^\d+]/g, ''),
                email: barberForm.email.trim() || undefined,
                photoUrl: barberForm.photoUrl.trim() || undefined,
                specializations: parseSpecializations(),
                experienceYears: Number(barberForm.experienceYears) || 0,
                commissionType: 'PERCENTAGE',
                commissionValue: Number(barberForm.commissionRate) || 0,
                services: barberForm.serviceIds,
                schedule: buildSchedule()
            };

            const response = await fetch(`${API_BASE_URL}/barbers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });
            const json = await response.json();
            if (!response.ok) {
                throw new Error(json?.error?.message || 'Gagal menambahkan barber');
            }

            const result = json?.data ?? json;
            if (result?.password && (result?.email || result?.username)) {
                const email =
                    result.email || (result.username ? `${result.username}@malasngantri.com` : '');
                setCreatedCredentials({
                    email,
                    password: result.password,
                    name: result.barber?.name || barberForm.name,
                    username: result.username || undefined
                });
            }
            setShowAddBarber(false);
            setBarberForm({
                name: '',
                phone: '',
                email: '',
                photoUrl: '',
                specializations: '',
                experienceYears: 0,
                commissionRate: 30,
                workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
                startTime: '09:00',
                endTime: '18:00',
                serviceIds: []
            });
            await load();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal menambahkan barber';
            setError(message);
        } finally {
            setIsCreatingBarber(false);
        }
    };

    const handleCreateService = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!accessToken) return;
        setError('');
        if (!serviceForm.name.trim() || serviceForm.price <= 0 || serviceForm.duration <= 0) {
            setError('Nama, harga, dan durasi wajib diisi.');
            return;
        }

        setIsCreatingService(true);
        try {
            const payload = {
                name: serviceForm.name.trim(),
                description: serviceForm.description.trim() || undefined,
                price: Number(serviceForm.price),
                duration: Number(serviceForm.duration)
            };

            const response = await fetch(`${API_BASE_URL}/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });
            const json = await response.json();
            if (!response.ok) {
                throw new Error(json?.error?.message || 'Gagal menambahkan layanan');
            }

            setShowAddService(false);
            setServiceForm({
                name: '',
                description: '',
                price: 0,
                duration: 30
            });
            await load();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal menambahkan layanan';
            setError(message);
        } finally {
            setIsCreatingService(false);
        }
    };

    const handleSaveShop = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!accessToken || !profile?.barbershopId) return;
        setError('');

        setIsSavingShop(true);
        try {
            const payload = {
                name: shopForm.name.trim(),
                address: shopForm.address.trim(),
                logoUrl: shopForm.logoUrl.trim() || null,
                description: shopForm.description.trim() || null,
                openingTime: shopForm.openingTime,
                closingTime: shopForm.closingTime,
                socialLinks: {
                    instagram: shopForm.instagram.trim(),
                    tiktok: shopForm.tiktok.trim(),
                    facebook: shopForm.facebook.trim(),
                    whatsapp: shopForm.whatsapp.trim(),
                    website: shopForm.website.trim()
                }
            };

            const response = await fetch(`${API_BASE_URL}/barbershops/${profile.barbershopId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });
            const json = await response.json();
            if (!response.ok) {
                throw new Error(json?.error?.message || 'Gagal menyimpan profil barbershop');
            }
            setShop(json.data);
            await load();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal menyimpan profil barbershop';
            setError(message);
        } finally {
            setIsSavingShop(false);
        }
    };

    const handleAddNew = () => {
        if (activeTab === 'barbers') {
            setShowAddBarber(true);
            return;
        }
        if (activeTab === 'services') {
            setShowAddService(true);
            return;
        }
        setActiveTab('barbers');
        setShowAddBarber(true);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30 flex">
            {/* Desktop Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-neutral-900/40 hidden lg:flex flex-col">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-8 h-8 bg-amber-500 rounded-lg rotate-12 flex items-center justify-center font-bold text-black border-2 border-white/10">M</div>
                        <h1 className="text-base font-black tracking-tight uppercase">MalasNgantri</h1>
                    </div>

                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-neutral-400 hover:bg-white/5'}`}
                        >
                            <BarChart3 size={18} /> Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('barbers')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'barbers' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-neutral-400 hover:bg-white/5'}`}
                        >
                            <Users size={18} /> Barbers
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'services' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-neutral-400 hover:bg-white/5'}`}
                        >
                            <Scissors size={18} /> Services
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-neutral-400 hover:bg-white/5'}`}
                        >
                            <Settings size={18} /> Settings
                        </button>
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-2xl border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-neutral-700" />
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-black uppercase tracking-widest leading-tight truncate">Owner Acct</p>
                            <p className="text-[8px] text-neutral-500 truncate">{profile?.email || '-'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="p-8 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 mb-1">Admin Panel</h2>
                        <h1 className="text-3xl font-black tracking-tight capitalize">{activeTab}</h1>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="bg-neutral-900 border border-white/10 hover:border-white/20 px-6 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all shadow-xl"
                    >
                        <Plus size={18} className="text-amber-500" /> Add New
                    </button>
                </header>

                <section className="p-8 space-y-8">
                    {error && (
                        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300">
                            {error}
                        </div>
                    )}

                    {loading && (
                        <div className="rounded-[2rem] border border-white/5 bg-neutral-900/40 p-8 text-center text-neutral-400">
                            Memuat data...
                        </div>
                    )}

                    {activeTab === 'overview' && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                {statCards.map((s, i) => (
                                    <div key={i} className="bg-neutral-900/40 border border-white/5 p-6 rounded-[2rem] hover:bg-neutral-900/60 transition-all hover:border-white/10">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-neutral-800 rounded-2xl">{s.icon}</div>
                                            <span className="text-[10px] font-black text-neutral-400 bg-white/5 px-2 py-1 rounded-full">Live</span>
                                        </div>
                                        <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">{s.label}</p>
                                        <h3 className="text-3xl font-black mt-1 tracking-tight">{s.value}</h3>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Barbers Management */}
                                <div className="xl:col-span-2 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold tracking-tight">Barber Staff</h3>
                                        <button
                                            className="text-amber-500 text-xs font-black uppercase tracking-widest hover:underline"
                                            onClick={() => setActiveTab('barbers')}
                                        >
                                            View All
                                        </button>
                                    </div>

                                    <div className="bg-neutral-900/40 border border-white/5 rounded-[2rem] overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="border-b border-white/5">
                                                <tr className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                                                    <th className="px-6 py-4 font-black">Staff Member</th>
                                                    <th className="px-6 py-4 font-black text-center">Status</th>
                                                    <th className="px-6 py-4 font-black text-center">Today</th>
                                                    <th className="px-6 py-4 font-black text-center">Rating</th>
                                                    <th className="px-6 py-4 font-black"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {barbers.map((b, i) => (
                                                    <tr key={i} className="group hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 bg-neutral-800 rounded-xl flex items-center justify-center font-bold text-neutral-400">
                                                                    {b.name[0]}
                                                                </div>
                                                                <span className="font-bold text-sm tracking-tight">{b.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${b.status === 'AVAILABLE'
                                                                    ? 'text-emerald-500 bg-emerald-500/10'
                                                                    : b.status === 'ON_BREAK'
                                                                        ? 'text-blue-500 bg-blue-500/10'
                                                                        : b.status === 'BUSY'
                                                                            ? 'text-amber-500 bg-amber-500/10'
                                                                            : 'text-neutral-500 bg-neutral-500/10'
                                                                }`}>{b.status}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-bold text-sm">{barberQueueCounts[b.id] || 0}</td>
                                                        <td className="px-6 py-4 text-center font-bold text-sm text-amber-500">{b.averageRating.toFixed(1)}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-500"><MoreVertical size={16} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {barbers.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-6 text-center text-neutral-500">
                                                            Belum ada barber.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Feed / Recent Activity */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold tracking-tight">Live Activity</h3>
                                    <div className="space-y-4">
                                        {recentQueues.length === 0 && (
                                            <div className="rounded-2xl border border-white/5 bg-neutral-900/40 p-6 text-sm text-neutral-400">
                                                Belum ada aktivitas.
                                            </div>
                                        )}
                                        {recentQueues.map((queue, i) => (
                                            <div key={queue.id} className="flex gap-4 group">
                                                <div className="relative flex flex-col items-center">
                                                    <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
                                                        <ClipboardList size={18} />
                                                    </div>
                                                    {i !== recentQueues.length - 1 && <div className="w-px h-full bg-white/10 mt-2" />}
                                                </div>
                                                <div className="pb-8">
                                                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-1">
                                                        {new Date(queue.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    <h4 className="text-sm font-bold tracking-tight">
                                                        {queue.customer?.fullName || queue.customerName || 'Customer'} • {queue.queueNumber}
                                                    </h4>
                                                    <p className="text-xs text-neutral-400 mt-1">
                                                        Service: {queue.service?.name || '-'} • Barber: {queue.barber?.name || '-'}
                                                    </p>
                                                    <div className="flex gap-2 mt-3">
                                                        <button className="p-1 px-3 bg-neutral-900 border border-white/5 rounded-lg text-[10px] font-bold uppercase hover:bg-neutral-800 transition-colors">
                                                            <Edit2 size={10} className="inline mr-1" /> View
                                                        </button>
                                                        <button className="p-1 px-3 bg-neutral-900 border border-white/5 rounded-lg text-[10px] font-bold uppercase hover:bg-neutral-800 transition-colors text-red-500">
                                                            <Trash2 size={10} className="inline mr-1" /> Flag
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'barbers' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold tracking-tight">Semua Barber</h3>
                                <button className="text-amber-500 text-xs font-black uppercase tracking-widest hover:underline" onClick={() => setActiveTab('overview')}>
                                    Kembali
                                </button>
                            </div>
                            <div className="rounded-[2rem] border border-white/5 bg-neutral-900/60 p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Tambah Barber</p>
                                        <h4 className="text-lg font-black">Input Data Karyawan</h4>
                                    </div>
                                    <button
                                        onClick={() => setShowAddBarber((prev) => !prev)}
                                        className="text-amber-500 text-xs font-black uppercase tracking-widest hover:underline"
                                    >
                                        {showAddBarber ? 'Tutup' : 'Tambah'}
                                    </button>
                                </div>
                                {showAddBarber && (
                                    <form className="space-y-4" onSubmit={handleCreateBarber}>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                                placeholder="Nama barber"
                                                value={barberForm.name}
                                                onChange={(e) => setBarberForm({ ...barberForm, name: e.target.value })}
                                            />
                                            <input
                                                type="tel"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                                placeholder="No. HP/WhatsApp"
                                                value={barberForm.phone}
                                                onChange={(e) => setBarberForm({ ...barberForm, phone: e.target.value })}
                                            />
                                            <input
                                                type="email"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                                placeholder="Email (opsional)"
                                                value={barberForm.email}
                                                onChange={(e) => setBarberForm({ ...barberForm, email: e.target.value })}
                                            />
                                            <input
                                                type="url"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                                placeholder="Photo URL (opsional)"
                                                value={barberForm.photoUrl}
                                                onChange={(e) => setBarberForm({ ...barberForm, photoUrl: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <input
                                                type="text"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium md:col-span-2"
                                                placeholder="Spesialisasi (pisahkan dengan koma)"
                                                value={barberForm.specializations}
                                                onChange={(e) => setBarberForm({ ...barberForm, specializations: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                                placeholder="Pengalaman (tahun)"
                                                min={0}
                                                value={barberForm.experienceYears}
                                                onChange={(e) => setBarberForm({ ...barberForm, experienceYears: Number(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <input
                                                type="number"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                                placeholder="Komisi (%)"
                                                min={0}
                                                value={barberForm.commissionRate}
                                                onChange={(e) => setBarberForm({ ...barberForm, commissionRate: Number(e.target.value) || 0 })}
                                            />
                                            <input
                                                type="time"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                                value={barberForm.startTime}
                                                onChange={(e) => setBarberForm({ ...barberForm, startTime: e.target.value })}
                                            />
                                            <input
                                                type="time"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                                value={barberForm.endTime}
                                                onChange={(e) => setBarberForm({ ...barberForm, endTime: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-2">Hari Kerja</p>
                                            <div className="flex flex-wrap gap-2">
                                                {dayOptions.map((day) => (
                                                    <button
                                                        key={day.value}
                                                        type="button"
                                                        onClick={() => toggleWorkingDay(day.value)}
                                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border transition ${barberForm.workingDays.includes(day.value)
                                                                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                                                : 'border-white/10 text-neutral-400'
                                                            }`}
                                                    >
                                                        {day.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-2">Pilih Layanan</p>
                                            <div className="flex flex-wrap gap-2">
                                                {services.map((service) => (
                                                    <button
                                                        key={service.id}
                                                        type="button"
                                                        onClick={() => toggleServiceSelection(service.id)}
                                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border transition ${barberForm.serviceIds.includes(service.id)
                                                                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                                                : 'border-white/10 text-neutral-400'
                                                            }`}
                                                    >
                                                        {service.name}
                                                    </button>
                                                ))}
                                                {services.length === 0 && (
                                                    <span className="text-xs text-neutral-500">Buat layanan terlebih dahulu.</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isCreatingBarber}
                                            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-70 text-black font-black py-4 rounded-2xl transition-all"
                                        >
                                            {isCreatingBarber ? 'Menyimpan...' : 'Simpan Barber'}
                                        </button>
                                    </form>
                                )}
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {barbers.map((barber) => (
                                    <div key={barber.id} className="rounded-[2rem] border border-white/5 bg-neutral-900/60 p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Barber</p>
                                                <p className="text-lg font-black">{barber.name}</p>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${barber.status === 'AVAILABLE'
                                                    ? 'text-emerald-500 bg-emerald-500/10'
                                                    : barber.status === 'ON_BREAK'
                                                        ? 'text-blue-500 bg-blue-500/10'
                                                        : barber.status === 'BUSY'
                                                            ? 'text-amber-500 bg-amber-500/10'
                                                            : 'text-neutral-500 bg-neutral-500/10'
                                                }`}>{barber.status}</span>
                                        </div>
                                        <div className="text-sm text-neutral-400">Rating: {barber.averageRating.toFixed(1)}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {(barber.services || []).length === 0 && (
                                                <span className="text-xs text-neutral-500">Belum ada layanan</span>
                                            )}
                                            {(barber.services || []).map((service) => (
                                                <span key={service.id} className="px-3 py-1 rounded-full bg-white/5 text-xs font-semibold text-neutral-300">
                                                    {service.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {barbers.length === 0 && (
                                    <div className="rounded-2xl border border-white/5 bg-neutral-900/40 p-6 text-sm text-neutral-400">
                                        Belum ada barber.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold tracking-tight">Daftar Layanan</h3>
                                <button className="text-amber-500 text-xs font-black uppercase tracking-widest hover:underline" onClick={() => setActiveTab('overview')}>
                                    Kembali
                                </button>
                            </div>
                            <div className="rounded-[2rem] border border-white/5 bg-neutral-900/60 p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Tambah Layanan</p>
                                        <h4 className="text-lg font-black">Input Styling & Harga</h4>
                                    </div>
                                    <button
                                        onClick={() => setShowAddService((prev) => !prev)}
                                        className="text-amber-500 text-xs font-black uppercase tracking-widest hover:underline"
                                    >
                                        {showAddService ? 'Tutup' : 'Tambah'}
                                    </button>
                                </div>
                                {showAddService && (
                                    <form className="space-y-4" onSubmit={handleCreateService}>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                                placeholder="Nama layanan"
                                                value={serviceForm.name}
                                                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                min={0}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                                placeholder="Harga (Rp)"
                                                value={serviceForm.price}
                                                onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <input
                                                type="number"
                                                min={1}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                                placeholder="Durasi (menit)"
                                                value={serviceForm.duration}
                                                onChange={(e) => setServiceForm({ ...serviceForm, duration: Number(e.target.value) || 0 })}
                                            />
                                            <input
                                                type="text"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                                placeholder="Deskripsi singkat"
                                                value={serviceForm.description}
                                                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isCreatingService}
                                            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-70 text-black font-black py-4 rounded-2xl transition-all"
                                        >
                                            {isCreatingService ? 'Menyimpan...' : 'Simpan Layanan'}
                                        </button>
                                    </form>
                                )}
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {services.map((service) => (
                                    <div key={service.id} className="rounded-[2rem] border border-white/5 bg-neutral-900/60 p-6 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Layanan</p>
                                                <p className="text-lg font-black">{service.name}</p>
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-amber-400">{service.duration}m</span>
                                        </div>
                                        <div className="text-sm text-neutral-400">Harga: Rp {service.price.toLocaleString('id-ID')}</div>
                                    </div>
                                ))}
                                {services.length === 0 && (
                                    <div className="rounded-2xl border border-white/5 bg-neutral-900/40 p-6 text-sm text-neutral-400">
                                        Belum ada layanan.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold tracking-tight">Pengaturan Barbershop</h3>
                                <button className="text-amber-500 text-xs font-black uppercase tracking-widest hover:underline" onClick={() => setActiveTab('overview')}>
                                    Kembali
                                </button>
                            </div>
                            <form className="space-y-6" onSubmit={handleSaveShop}>
                                <div className="rounded-[2rem] border border-white/5 bg-neutral-900/60 p-6 space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                            placeholder="Nama Barbershop"
                                            value={shopForm.name}
                                            onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 px-4 text-neutral-400"
                                            placeholder="Slug"
                                            value={shopForm.slug}
                                            disabled
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                        placeholder="Alamat barbershop"
                                        value={shopForm.address}
                                        onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                                    />
                                    <input
                                        type="url"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                        placeholder="Logo URL"
                                        value={shopForm.logoUrl}
                                        onChange={(e) => setShopForm({ ...shopForm, logoUrl: e.target.value })}
                                    />
                                    <textarea
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                        placeholder="Deskripsi barbershop"
                                        rows={4}
                                        value={shopForm.description}
                                        onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
                                    />
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input
                                            type="time"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                            value={shopForm.openingTime}
                                            onChange={(e) => setShopForm({ ...shopForm, openingTime: e.target.value })}
                                        />
                                        <input
                                            type="time"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                            value={shopForm.closingTime}
                                            onChange={(e) => setShopForm({ ...shopForm, closingTime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="rounded-[2rem] border border-white/5 bg-neutral-900/60 p-6 space-y-4">
                                    <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Social Media</p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                            placeholder="Instagram"
                                            value={shopForm.instagram}
                                            onChange={(e) => setShopForm({ ...shopForm, instagram: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                            placeholder="TikTok"
                                            value={shopForm.tiktok}
                                            onChange={(e) => setShopForm({ ...shopForm, tiktok: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                            placeholder="Facebook"
                                            value={shopForm.facebook}
                                            onChange={(e) => setShopForm({ ...shopForm, facebook: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                            placeholder="WhatsApp"
                                            value={shopForm.whatsapp}
                                            onChange={(e) => setShopForm({ ...shopForm, whatsapp: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="w-full md:col-span-2 bg-black/40 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                            placeholder="Website"
                                            value={shopForm.website}
                                            onChange={(e) => setShopForm({ ...shopForm, website: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSavingShop}
                                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-70 text-black font-black py-4 rounded-2xl transition-all"
                                >
                                    {isSavingShop ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </form>
                        </div>
                    )}
                </section>
            </main>
            {createdCredentials && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
                    <div className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-neutral-900/90 p-8 space-y-6 shadow-2xl">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Akun Barber Dibuat</p>
                            <h3 className="text-2xl font-black">Simpan kredensial ini</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
                                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Email Login</p>
                                <p className="text-lg font-black text-amber-400 break-all">{createdCredentials.email}</p>
                            </div>
                            <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
                                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Password</p>
                                <p className="text-lg font-black text-white">{createdCredentials.password}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        `Email Login: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`
                                    );
                                }}
                                className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition"
                            >
                                Salin
                            </button>
                            <button
                                onClick={() => setCreatedCredentials(null)}
                                className="bg-amber-500 text-black px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
