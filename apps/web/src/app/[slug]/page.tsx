"use client";

import { useParams } from 'next/navigation';
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

export default function BarbershopProfilePage() {
    const { slug } = useParams();

    // Mock data for initial UI build
    const shopData = {
        name: "Classic Cut Barbershop",
        rating: 4.9,
        reviews: 128,
        address: "123 Grooming St, Suite 101, New York",
        phone: "+1 (555) 000-CUTS",
        hours: "Open until 9:00 PM",
        description: "Experience the art of traditional grooming combined with modern style. Our master barbers are dedicated to making you look your best.",
    };

    const services = [
        { name: "Executive Haircut", price: "$45", duration: "45m", icon: <Sparkles className="text-amber-500" /> },
        { name: "Beard Sculpture", price: "$30", duration: "30m", icon: <ShieldCheck className="text-amber-500" /> },
        { name: "Royal Shave", price: "$40", duration: "40m", icon: <Sparkles className="text-amber-500" /> },
        { name: "The Works", price: "$85", duration: "90m", icon: <Check className="text-amber-500" /> },
    ];

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
                                        {shopData.rating}
                                    </div>
                                    <span className="text-neutral-500 text-sm">{shopData.reviews} reviews</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter">{shopData.name}</h1>
                                <div className="flex flex-wrap gap-4 text-neutral-400 text-sm">
                                    <span className="flex items-center gap-1"><MapPin size={16} /> {shopData.address}</span>
                                    <span className="flex items-center gap-1"><Clock size={16} /> {shopData.hours}</span>
                                    <span className="flex items-center gap-1"><Phone size={16} /> {shopData.phone}</span>
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
                            {shopData.description}
                        </div>
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
                                            {s.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{s.name}</h4>
                                            <p className="text-neutral-500 text-sm">{s.duration}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black text-white">{s.price}</div>
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
