"use client";

import { useState } from 'react';
import {
    Users,
    Clock,
    Play,
    CheckCircle,
    PauseCircle,
    Moon,
    Power,
    ChevronRight,
    User,
    Scissors
} from 'lucide-react';

export default function BarberDashboard() {
    const [status, setStatus] = useState('AVAILABLE');
    const [activeQueueId, setActiveQueueId] = useState<string | null>(null);

    const mockQueues = [
        { id: '1', name: 'John Doe', service: 'Executive Haircut', time: '14:30', status: 'WAITING' },
        { id: '2', name: 'Mike Smith', service: 'Beard Sculpture', time: '15:15', status: 'WAITING' },
        { id: '3', name: 'Guest User', service: 'Royal Shave', time: '15:45', status: 'WAITING' },
    ];

    const statusColors: Record<string, string> = {
        AVAILABLE: 'bg-green-500',
        BUSY: 'bg-amber-500',
        BREAK: 'bg-blue-500',
        OFFLINE: 'bg-neutral-500',
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30">
            {/* Sidebar/Nav Placeholder for Mobile */}
            <nav className="p-6 flex items-center justify-between border-b border-white/5 bg-neutral-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl rotate-12 flex items-center justify-center font-bold text-black border-2 border-white/10">M</div>
                    <div>
                        <h1 className="text-sm font-black tracking-tight leading-none uppercase">Barber Station</h1>
                        <p className="text-[10px] text-neutral-500 font-bold tracking-tighter uppercase">Station #04 • Alex Rivera</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse`} />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-transparent text-xs font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
                    >
                        <option value="AVAILABLE" className="bg-neutral-900">Available</option>
                        <option value="BUSY" className="bg-neutral-900">Busy</option>
                        <option value="BREAK" className="bg-neutral-900">On Break</option>
                        <option value="OFFLINE" className="bg-neutral-900">Offline</option>
                    </select>
                </div>
            </nav>

            <main className="p-6 max-w-5xl mx-auto grid md:grid-cols-12 gap-6">
                {/* Active Session */}
                <div className="md:col-span-8 space-y-6">
                    <section className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Current Session</h3>
                        <div className="bg-neutral-900/60 border-2 border-amber-500/20 rounded-[2rem] p-8 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                                <Scissors size={180} />
                            </div>

                            {activeQueueId ? (
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase">In Progress</span>
                                            <h2 className="text-4xl font-black tracking-tight">John Doe</h2>
                                            <p className="text-neutral-400 font-medium">Executive Haircut • Started 12 mins ago</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Est. End</p>
                                            <p className="text-xl font-black">14:55</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setActiveQueueId(null)}
                                            className="flex-1 bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all"
                                        >
                                            <CheckCircle size={20} /> Finish Service
                                        </button>
                                        <button className="px-6 rounded-2xl bg-neutral-800 border border-white/5 hover:bg-neutral-700 transition-colors">
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
                            <span className="bg-neutral-900 border border-white/5 text-[10px] font-black px-2 py-1 rounded-lg">3 Customers</span>
                        </div>

                        <div className="space-y-3">
                            {mockQueues.map((q) => (
                                <div
                                    key={q.id}
                                    className="bg-neutral-900/40 border border-white/5 p-5 rounded-2xl flex items-center justify-between hover:bg-neutral-900/60 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 font-bold">
                                            {q.name === 'Guest User' ? <Users size={18} /> : q.name[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm tracking-tight">{q.name}</h4>
                                            <p className="text-[10px] text-neutral-500 font-bold uppercase">{q.service}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Wait</p>
                                            <p className="text-xs font-black">{q.time}</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveQueueId(q.id)}
                                            className="p-3 bg-neutral-800 group-hover:bg-amber-500 group-hover:text-black rounded-xl transition-all"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                                    <span>8/12</span>
                                </div>
                                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 w-[66%] rounded-full" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-2xl font-black">4.9</p>
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase">Avg Rating</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black">$342</p>
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase">Est. Revenue</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="bg-neutral-900 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors">
                                <Moon size={18} className="text-blue-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest">End Day</span>
                            </button>
                            <button className="bg-neutral-900 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-neutral-800 transition-colors text-red-500">
                                <Power size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
