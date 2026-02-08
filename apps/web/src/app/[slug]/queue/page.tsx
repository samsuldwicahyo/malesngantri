"use client";

import { useState, useEffect } from 'react';
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
    User
} from 'lucide-react';
import Link from 'next/link';

export default function QueuePage() {
    const { slug } = useParams();
    const [isJoining, setIsJoining] = useState(false);
    const [joined, setJoined] = useState(false);
    const [name, setName] = useState('');
    const [service, setService] = useState('');

    // Mock data for initial UI build
    const shopData = {
        name: "Classic Cut Barbershop",
        address: "123 Grooming St, Suite 101",
        avgWait: "45 min",
        peopleInQueue: 4
    };

    const services = [
        { id: '1', name: 'Haircut & Styling', price: '$35', duration: '30 min' },
        { id: '2', name: 'Beard Trim', price: '$20', duration: '15 min' },
        { id: '3', name: 'Hot Towel Shave', price: '$25', duration: '25 min' },
        { id: '4', name: 'Full Grooming Kit', price: '$55', duration: '50 min' },
    ];

    const handleJoinQueue = (e: React.FormEvent) => {
        e.preventDefault();
        setIsJoining(true);
        // Simulate API call
        setTimeout(() => {
            setIsJoining(false);
            setJoined(true);
        }, 1500);
    };

    if (joined) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
                <div className="max-w-md mx-auto space-y-8 pt-12">
                    <div className="text-center space-y-4">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-4 animate-bounce">
                            <CheckCircle2 size={40} />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">You&apos;re in Line!</h1>
                        <p className="text-neutral-400">We&apos;ll notify you when it&apos;s almost your turn.</p>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-white/5 p-8 shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Users size={80} />
                        </div>

                        <div className="space-y-6">
                            <div className="text-center">
                                <span className="text-neutral-500 text-sm uppercase tracking-widest font-semibold">Your Position</span>
                                <div className="text-6xl font-black text-amber-500 mt-2">#5</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="bg-neutral-800/50 rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                                        <Clock size={14} />
                                        <span>Est. Wait</span>
                                    </div>
                                    <div className="text-lg font-bold">~42 min</div>
                                </div>
                                <div className="bg-neutral-800/50 rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                                        <Calendar size={14} />
                                        <span>Time</span>
                                    </div>
                                    <div className="text-lg font-bold">14:45</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Barber</span>
                                    <span className="font-semibold text-white">Any Available</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Service</span>
                                    <span className="font-semibold text-white">Classic Haircut</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-4 rounded-2xl bg-neutral-900 border border-white/10 text-neutral-400 font-semibold hover:bg-neutral-800 transition-colors">
                        Cancel My Spot
                    </button>
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
                            <h1 className="text-3xl font-bold tracking-tight">{shopData.name}</h1>
                            <p className="text-neutral-500 text-sm flex items-center gap-1">
                                <MapPin size={14} /> {shopData.address}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-amber-500 rounded-2xl rotate-3 flex items-center justify-center font-bold text-black border-2 border-white/10 shadow-lg shadow-amber-500/20">
                            {shopData.name[0]}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-neutral-900 rounded-2xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1 uppercase tracking-wider font-bold">
                                <Users size={14} />
                                <span>In Queue</span>
                            </div>
                            <div className="text-2xl font-black">{shopData.peopleInQueue} People</div>
                        </div>
                        <div className="bg-neutral-900 rounded-2xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1 uppercase tracking-wider font-bold">
                                <Clock size={14} />
                                <span>Wait Time</span>
                            </div>
                            <div className="text-2xl font-black">{shopData.avgWait}</div>
                        </div>
                    </div>
                </section>

                {/* Join Queue Form */}
                <section className="space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold tracking-tight">Select a Service</h3>
                        <p className="text-neutral-500 text-sm">Choose what you&apos;re looking for today</p>
                    </div>

                    <form onSubmit={handleJoinQueue} className="space-y-6">
                        <div className="grid gap-3">
                            {services.map((s) => (
                                <label
                                    key={s.id}
                                    className={`relative flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${service === s.id
                                        ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500'
                                        : 'bg-neutral-900 border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="service"
                                        value={s.id}
                                        className="sr-only"
                                        onChange={() => setService(s.id)}
                                        required
                                    />
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${service === s.id ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400'
                                            }`}>
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold">{s.name}</div>
                                            <div className="text-xs text-neutral-500">{s.duration}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-white">{s.price}</div>
                                    </div>
                                </label>
                            ))}
                        </div>

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

                            <button
                                type="submit"
                                disabled={isJoining}
                                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-black py-5 rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 group"
                            >
                                {isJoining ? (
                                    <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Join Queue
                                        <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
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
