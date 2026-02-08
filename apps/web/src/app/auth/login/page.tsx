"use client";

import { useState } from 'react';
import {
    User,
    Lock,
    ArrowRight,
    ShieldCheck,
    Scissors
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30 flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0" />

            <div className="w-full max-w-md relative z-10 space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex w-16 h-16 bg-amber-500 rounded-2xl rotate-12 items-center justify-center text-black border-2 border-white/10 shadow-2xl shadow-amber-500/20 translate-y-0 hover:-translate-y-2 transition-transform duration-500 cursor-pointer">
                        <Scissors size={32} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight uppercase">MalasNgantri</h1>
                        <p className="text-neutral-500 text-xs font-bold uppercase tracking-[0.3em]">Business Portal</p>
                    </div>
                </div>

                <div className="bg-neutral-900/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold">Welcome Back</h2>
                        <p className="text-neutral-500 text-sm">Please enter your credentials to manage your station.</p>
                    </div>

                    <form className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-4">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-600">
                                    <User size={18} />
                                </div>
                                <input
                                    type="email"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                    placeholder="alex@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-4">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-600">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-2 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-4 h-4 rounded bg-neutral-800 border border-white/5 peer-checked:bg-amber-500 peer-checked:border-amber-500 flex items-center justify-center transition-all">
                                    <ShieldCheck size={10} className="text-black hidden peer-checked:block" />
                                </div>
                                <span className="text-xs text-neutral-500 group-hover:text-neutral-400">Remember Me</span>
                            </label>
                            <Link href="#" className="text-xs text-amber-500 font-bold hover:underline">Forgot password?</Link>
                        </div>

                        <button
                            type="button"
                            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-5 rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 group mt-8"
                        >
                            Sign In to Station
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>

                <div className="text-center pt-8">
                    <p className="text-neutral-500 text-sm">Don't have a barbershop yet?</p>
                    <button className="text-white font-bold hover:text-amber-500 transition-colors mt-2">Apply for Partnership</button>
                </div>
            </div>
        </div>
    );
}
