"use client";

import { useState } from 'react';
import {
    Users,
    Settings,
    BarChart3,
    Plus,
    ClipboardList,
    Scissors,
    DollarSign,
    TrendingUp,
    MoreVertical,
    Edit2,
    Trash2
} from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    const stats = [
        { label: 'Total Revenue', value: '$2,450', change: '+12%', icon: <DollarSign size={20} className="text-emerald-500" /> },
        { label: 'Total Clients', value: '154', change: '+5%', icon: <Users size={20} className="text-blue-500" /> },
        { label: 'Avg. Rating', value: '4.8', change: '+0.2', icon: <TrendingUp size={20} className="text-amber-500" /> },
        { label: 'Wait Time', value: '18m', change: '-4m', icon: <BarChart3 size={20} className="text-purple-500" /> },
    ];

    const barbers = [
        { name: 'Alex Rivera', status: 'Active', today: 12, rating: 4.9 },
        { name: 'Sarah Chen', status: 'Break', today: 8, rating: 4.8 },
        { name: 'James Wilson', status: 'Offline', today: 0, rating: 4.7 },
    ];

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
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-neutral-400 hover:bg-white/5 transition-all">
                            <Settings size={18} /> Settings
                        </button>
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-2xl border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-neutral-700" />
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-black uppercase tracking-widest leading-tight truncate">Owner Acct</p>
                            <p className="text-[8px] text-neutral-500 truncate">admin@classiccut.com</p>
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
                    <button className="bg-neutral-900 border border-white/10 hover:border-white/20 px-6 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all shadow-xl">
                        <Plus size={18} className="text-amber-500" /> Add New
                    </button>
                </header>

                <section className="p-8 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {stats.map((s, i) => (
                            <div key={i} className="bg-neutral-900/40 border border-white/5 p-6 rounded-[2rem] hover:bg-neutral-900/60 transition-all hover:border-white/10">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-neutral-800 rounded-2xl">{s.icon}</div>
                                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">{s.change}</span>
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
                                <button className="text-amber-500 text-xs font-black uppercase tracking-widest hover:underline">View All</button>
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
                                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${b.status === 'Active' ? 'text-emerald-500 bg-emerald-500/10' :
                                                            b.status === 'Break' ? 'text-blue-500 bg-blue-500/10' : 'text-neutral-500 bg-neutral-500/10'
                                                        }`}>{b.status}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-sm">{b.today}</td>
                                                <td className="px-6 py-4 text-center font-bold text-sm text-amber-500">{b.rating}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-500"><MoreVertical size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Feed / Recent Activity */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold tracking-tight">Live Activity</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="relative flex flex-col items-center">
                                            <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
                                                <ClipboardList size={18} />
                                            </div>
                                            {i !== 2 && <div className="w-px h-full bg-white/10 mt-2" />}
                                        </div>
                                        <div className="pb-8">
                                            <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-1">2 mins ago</p>
                                            <h4 className="text-sm font-bold tracking-tight">John Doe checked in</h4>
                                            <p className="text-xs text-neutral-400 mt-1">Service: Executive Haircut • Barber: Alex Rivera</p>
                                            <div className="flex gap-2 mt-3">
                                                <button className="p-1 px-3 bg-neutral-900 border border-white/5 rounded-lg text-[10px] font-bold uppercase hover:bg-neutral-800 transition-colors"><Edit2 size={10} className="inline mr-1" /> Edit</button>
                                                <button className="p-1 px-3 bg-neutral-900 border border-white/5 rounded-lg text-[10px] font-bold uppercase hover:bg-neutral-800 transition-colors text-red-500"><Trash2 size={10} className="inline mr-1" /> Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
