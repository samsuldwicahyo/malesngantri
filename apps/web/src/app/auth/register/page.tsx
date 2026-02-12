"use client";

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Building2,
    User,
    Mail,
    PhoneCall,
    Lock,
    ArrowRight,
    Scissors,
    ShieldCheck
} from 'lucide-react';

const slugify = (value: string) => {
    return value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
};

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [barbershopName, setBarbershopName] = useState('');
    const [slug, setSlug] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!barbershopName.trim()) {
            setSlug('');
            return;
        }
        setSlug(slugify(barbershopName));
    }, [barbershopName]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (!fullName.trim() || !email.trim() || !phoneNumber.trim() || !password || !barbershopName.trim()) {
            setError('Semua field wajib diisi.');
            return;
        }
        if (password.length < 8) {
            setError('Password minimal 8 karakter.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Konfirmasi password tidak cocok.');
            return;
        }
        if (!slug) {
            setError('Slug barbershop wajib diisi.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: fullName.trim(),
                    email: email.trim(),
                    phoneNumber: phoneNumber.trim(),
                    password,
                    barbershopName: barbershopName.trim(),
                    slug
                })
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok || payload?.success === false) {
                const message =
                    payload?.error?.message ||
                    payload?.message ||
                    'Registrasi gagal.';
                throw new Error(message);
            }

            const data = payload?.data ?? payload;
            const accessToken = data?.accessToken || data?.access_token;
            const refreshToken = data?.refreshToken;

            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
            }
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            if (data?.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            router.push('/dashboard/admin?tab=settings');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registrasi gagal.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex w-16 h-16 bg-amber-500 rounded-2xl rotate-12 items-center justify-center text-black border-2 border-white/10 shadow-2xl shadow-amber-500/20">
                        <Scissors size={32} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tight uppercase">Daftarkan Barbershop</h1>
                        <p className="text-neutral-500 text-xs font-bold uppercase tracking-[0.3em]">Owner Portal</p>
                    </div>
                </div>

                <div className="bg-neutral-900/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-4">Nama Owner</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-600">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                        placeholder="Nama lengkap"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-4">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-600">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                        placeholder="owner@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-4">WhatsApp</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-600">
                                        <PhoneCall size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                        placeholder="08xx / +62"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-4">Nama Barbershop</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-600">
                                        <Building2 size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                        placeholder="Nama barbershop"
                                        value={barbershopName}
                                        onChange={(e) => setBarbershopName(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
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
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-4">Konfirmasi Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-600">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-4">Slug Barbershop</label>
                            <input
                                type="text"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                placeholder="contoh: malasngantri-barber"
                                value={slug}
                                onChange={(e) => setSlug(slugify(e.target.value))}
                            />
                            <p className="text-[10px] text-neutral-500 ml-2">Slug digunakan untuk URL publik.</p>
                        </div>

                        {error ? (
                            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300">
                                {error}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-70 text-black font-black py-5 rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? 'Mendaftarkan...' : 'Daftarkan Barbershop'}
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>

                <div className="text-center text-sm text-neutral-500">
                    Sudah punya akun?{' '}
                    <Link href="/auth/login" className="text-amber-500 font-bold hover:underline">
                        Login di sini
                    </Link>
                </div>
            </div>
        </div>
    );
}
