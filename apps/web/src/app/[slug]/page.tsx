"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    Star,
    MapPin,
    Clock,
    Phone,
    Info,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Check
} from 'lucide-react';
import Link from 'next/link';

type Barbershop = {
    id: string;
    name: string;
    address?: string | null;
    phoneNumber?: string | null;
    averageRating?: number;
    totalReviews?: number;
    openingTime?: string;
    closingTime?: string;
    description?: string | null;
};

type Service = {
    id: string;
    name: string;
    price: number;
    duration: number;
    description?: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export default function BarbershopProfilePage() {
    const { slug } = useParams();
    const [shopData, setShopData] = useState<Barbershop | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (typeof slug !== 'string') return;
        const load = async () => {
            try {
                setError('');
                const shopRes = await fetch(`${API_BASE_URL}/barbershops/slug/${slug}`);
                const shopJson = await shopRes.json();
                if (!shopRes.ok) {
                    throw new Error(shopJson?.error?.message || 'Barbershop tidak ditemukan');
                }

                setShopData(shopJson.data);

                const serviceRes = await fetch(`${API_BASE_URL}/barbershops/${shopJson.data.id}/services`);
                const serviceJson = await serviceRes.json();
                if (!serviceRes.ok) {
                    throw new Error(serviceJson?.error?.message || 'Gagal memuat layanan');
                }
                setServices(serviceJson.data || []);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Gagal memuat data';
                setError(message);
            }
        };

        load();
    }, [slug]);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30">
            {/* Hero Section */}
            <div className="relative h-64 md:h-96 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-neutral-900 group-hover:scale-105 transition-transform duration-700 bg-[url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
            </div>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 -mt-32 relative z-20 pb-20">
                <div className="space-y-8">
                    {/* Main Info Card */}
                    <div className="bg-neutral-900/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-sm font-bold border border-amber-500/20">
                                        <Star size={14} fill="currentColor" />
                                        {shopData?.averageRating?.toFixed(1) || '0.0'}
                                    </div>
                                    <span className="text-neutral-500 text-sm">{shopData?.totalReviews || 0} reviews</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter">{shopData?.name || 'Barbershop'}</h1>
                                <div className="flex flex-wrap gap-4 text-neutral-400 text-sm">
                                    <span className="flex items-center gap-1"><MapPin size={16} /> {shopData?.address || '-'}</span>
                                    <span className="flex items-center gap-1"><Clock size={16} /> {shopData?.openingTime || '09:00'} - {shopData?.closingTime || '18:00'}</span>
                                    <span className="flex items-center gap-1"><Phone size={16} /> {shopData?.phoneNumber || '-'}</span>
                                </div>
                            </div>

                            <Link
                                href={`/${slug}/queue`}
                                className="bg-amber-500 hover:bg-amber-600 text-black font-black px-8 py-5 rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 group whitespace-nowrap"
                            >
                                Join the Queue
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 text-neutral-400 leading-relaxed max-w-2xl">
                            {shopData?.description || 'Barbershop terbaik untuk gaya rambut dan perawatan pria.'}
                        </div>
                        {error ? (
                            <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300">
                                {error}
                            </div>
                        ) : null}
                    </div>

                    {/* Services Grid */}
                    <section className="space-y-6">
                        <h3 className="text-2xl font-bold tracking-tight px-2">Popular Services</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {services.map((s, i) => (
                                <div
                                    key={i}
                                    className="group bg-neutral-900/40 hover:bg-neutral-900/60 border border-white/5 hover:border-white/10 p-6 rounded-3xl transition-all cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            {i % 2 === 0 ? <Sparkles className="text-amber-500" /> : <ShieldCheck className="text-amber-500" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{s.name}</h4>
                                            <p className="text-neutral-500 text-sm">{s.duration}m</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black text-white">Rp {s.price.toLocaleString('id-ID')}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Footer Info */}
                    <div className="grid md:grid-cols-3 gap-4 pt-4">
                        <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-3xl space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                            <h5 className="font-bold text-sm">Certified Barbers</h5>
                            <p className="text-neutral-500 text-xs">All our staff are licensed professionals with 5+ years experience.</p>
                        </div>
                        <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-3xl space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                                <Check size={20} />
                            </div>
                            <h5 className="font-bold text-sm">Sanitized Tools</h5>
                            <p className="text-neutral-500 text-xs">We follow strict hygiene protocols with medical-grade sanitization.</p>
                        </div>
                        <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-3xl space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                                <Info size={20} />
                            </div>
                            <h5 className="font-bold text-sm">Walk-ins Welcome</h5>
                            <p className="text-neutral-500 text-xs">Join our virtual queue and enjoy coffee while you wait.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
