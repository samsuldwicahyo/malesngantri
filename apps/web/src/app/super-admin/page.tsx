"use client";

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

type Barbershop = {
    id: string;
    name: string;
    slug: string;
    address?: string | null;
    subscriptionStatus: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
};

type Stats = {
    totalBarbershops: number;
    activeBarbershops: number;
    suspendedBarbershops: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export default function SuperAdminPage() {
    const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [isMutating, setIsMutating] = useState(false);

    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return barbershops;
        return barbershops.filter((b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q));
    }, [barbershops, search]);

    const loadData = async () => {
        if (!accessToken) {
            setError('Login sebagai SUPER ADMIN terlebih dahulu.');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError('');
            const [shopsRes, statsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/super-admin/barbershops`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }),
                fetch(`${API_BASE_URL}/super-admin/stats`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
            ]);

            const shopsJson = await shopsRes.json();
            const statsJson = await statsRes.json();

            if (!shopsRes.ok) {
                throw new Error(shopsJson?.error?.message || 'Gagal memuat barbershop');
            }
            if (!statsRes.ok) {
                throw new Error(statsJson?.error?.message || 'Gagal memuat statistik');
            }

            const mapped = (shopsJson.data?.barbershops || []).map((shop: any) => ({
                id: shop.id,
                name: shop.name,
                slug: shop.slug || shop.name?.toLowerCase().replace(/\s+/g, '-'),
                address: shop.city || shop.address || '-',
                subscriptionStatus: shop.status || shop.subscriptionStatus || 'ACTIVE'
            }));
            setBarbershops(mapped);
            setStats({
                totalBarbershops: statsJson.data?.totalBarbershops || 0,
                activeBarbershops: statsJson.data?.activeBarbershops || 0,
                suspendedBarbershops: statsJson.data?.suspendedBarbershops || 0
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal memuat data';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const runAction = async (id: string, action: 'activate' | 'suspend' | 'delete') => {
        if (!accessToken) return;
        setIsMutating(true);
        try {
            const url =
                action === 'delete'
                    ? `${API_BASE_URL}/super-admin/barbershops/${id}`
                    : `${API_BASE_URL}/super-admin/barbershops/${id}/${action}`;
            const method = action === 'delete' ? 'DELETE' : 'PATCH';

            const response = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload?.error?.message || 'Aksi gagal');
            }
            await loadData();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Aksi gagal';
            setError(message);
        } finally {
            setIsMutating(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30">
            <header className="sticky top-0 z-40 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-amber-500 font-black">Super Admin</p>
                        <h1 className="text-2xl font-black tracking-tight">Barbershop Control Center</h1>
                    </div>
                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition"
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
                {stats && (
                    <section className="grid md:grid-cols-3 gap-4">
                        <div className="rounded-3xl border border-white/5 bg-neutral-900/60 p-6">
                            <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Total Barbershop</p>
                            <p className="text-3xl font-black mt-2">{stats.totalBarbershops}</p>
                        </div>
                        <div className="rounded-3xl border border-white/5 bg-neutral-900/60 p-6">
                            <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Aktif</p>
                            <p className="text-3xl font-black mt-2 text-emerald-400">{stats.activeBarbershops}</p>
                        </div>
                        <div className="rounded-3xl border border-white/5 bg-neutral-900/60 p-6">
                            <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Suspended</p>
                            <p className="text-3xl font-black mt-2 text-red-400">{stats.suspendedBarbershops}</p>
                        </div>
                    </section>
                )}

                <section className="rounded-[2rem] border border-white/5 bg-neutral-900/60 p-6 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-black">Daftar Barbershop</h2>
                            <p className="text-sm text-neutral-400">Kelola status langganan dan aktivitas tenant.</p>
                        </div>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama atau slug..."
                            className="w-full md:w-64 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                    </div>

                    {error && (
                        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="py-12 text-center text-neutral-400">Memuat data...</div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((shop) => (
                                <div
                                    key={shop.id}
                                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-white/5 bg-neutral-950/40 px-5 py-4"
                                >
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500 font-bold">{shop.slug}</p>
                                        <p className="text-lg font-black">{shop.name}</p>
                                        <p className="text-xs text-neutral-500">{shop.address || '-'}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span
                                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                                                shop.subscriptionStatus === 'ACTIVE'
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : shop.subscriptionStatus === 'SUSPENDED'
                                                        ? 'bg-red-500/10 text-red-400'
                                                        : 'bg-yellow-500/10 text-yellow-400'
                                            }`}
                                        >
                                            {shop.subscriptionStatus}
                                        </span>
                                        <button
                                            disabled={isMutating}
                                            onClick={() => runAction(shop.id, 'activate')}
                                            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10"
                                        >
                                            <CheckCircle2 size={14} /> Activate
                                        </button>
                                        <button
                                            disabled={isMutating}
                                            onClick={() => runAction(shop.id, 'suspend')}
                                            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10"
                                        >
                                            <AlertTriangle size={14} /> Suspend
                                        </button>
                                        <button
                                            disabled={isMutating}
                                            onClick={() => runAction(shop.id, 'delete')}
                                            className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-300 hover:bg-red-500/20"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div className="py-10 text-center text-neutral-500">Tidak ada barbershop.</div>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
