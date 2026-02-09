import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { useSocket } from '../../../contexts/SocketContext';
import { useEffect } from 'react';
import { ClockIcon, UserIcon, PhoneIcon } from '@heroicons/react/24/outline';
import apiClient from '../../../api/axios';

const QueueMonitor = () => {
    const { user } = useAuth();
    const { socket } = useSocket();

    // Fetch all active queues
    const { data: queues, refetch } = useQuery({
        queryKey: ['allQueues', user?.barbershop?.id],
        queryFn: async () => {
            const today = new Date().toISOString().split('T')[0];
            const { data } = await apiClient.get(`/barbershops/${user.barbershop.id}/queues`, {
                params: { date: today, status: 'WAITING,IN_PROGRESS' }
            });
            return data.data;
        },
        enabled: !!user?.barbershop?.id,
        refetchInterval: 10000 // Refetch every 10 seconds
    });

    // Socket.IO real-time updates
    useEffect(() => {
        if (socket && user?.barbershop?.id) {
            socket.emit('join-room', `barbershop:${user.barbershop.id}`);

            socket.on('queue:updated', () => {
                refetch();
            });

            return () => {
                socket.off('queue:updated');
            };
        }
    }, [socket, user?.barbershop?.id, refetch]);

    const waitingQueues = queues?.filter(q => q.status === 'WAITING') || [];
    const inProgressQueues = queues?.filter(q => q.status === 'IN_PROGRESS') || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Real-time Queue Monitor</h1>
                <p className="text-gray-400 mt-1">Monitor semua antrian aktif di barbershop Anda</p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border-amber-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="flex items-center gap-6">
                        <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-amber-900/10">
                            <ClockIcon className="h-10 w-10 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-amber-500/50 uppercase tracking-[0.2em]">Waiting Now</p>
                            <p className="text-5xl font-black text-white mt-1 drop-shadow-glow-amber">{waitingQueues.length}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border-green-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="flex items-center gap-6">
                        <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-green-900/10">
                            <UserIcon className="h-10 w-10 text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-green-500/50 uppercase tracking-[0.2em]">In Progress</p>
                            <p className="text-5xl font-black text-white mt-1 drop-shadow-glow-green">{inProgressQueues.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* In Progress Queues */}
            {inProgressQueues.length > 0 && (
                <div className="glass-card p-6 rounded-3xl border border-green-500/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        Sedang Dilayani
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {inProgressQueues.map(queue => (
                            <div key={queue.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 transition-all hover:border-green-500/30 group">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="font-black text-white text-xl group-hover:text-green-500 transition-colors">{queue.customerName}</p>
                                        <p className="text-[10px] font-black text-gray-500 tracking-[0.2em] mt-1 bg-gray-800 px-2 py-0.5 rounded-full inline-block">Q-NO: {queue.queueNumber}</p>
                                    </div>
                                    <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border border-green-500/20">
                                        Active
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-amber-500">💈</div>
                                        <p className="text-gray-300 font-bold">{queue.barber?.name}</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-amber-500">✂️</div>
                                        <p className="text-gray-300 font-bold">{queue.service?.name}</p>
                                    </div>
                                    {queue.customerPhone && (
                                        <div className="flex items-center gap-3 text-sm pt-2 border-t border-gray-800">
                                            <PhoneIcon className="h-4 w-4 text-amber-500" />
                                            <p className="text-gray-400 font-medium">{queue.customerPhone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Waiting Queues */}
            {waitingQueues.length > 0 && (
                <div className="glass-card p-6 rounded-3xl border border-gray-700/50 relative overflow-hidden">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                        <span className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></span>
                        Menunggu Antrian
                    </h3>
                    <div className="grid gap-4">
                        {waitingQueues.map((queue, index) => (
                            <div key={queue.id} className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-6 hover:bg-gray-800/50 hover:border-amber-500/30 transition-all group">
                                <div className="bg-amber-500 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg shadow-amber-900/20 ring-4 ring-amber-500/10">
                                    <span className="text-[10px] leading-none uppercase mb-0.5 opacity-70">No</span>
                                    <span className="text-xl leading-none">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-black text-white text-lg group-hover:text-amber-500 transition-colors uppercase tracking-tight">{queue.customerName}</p>
                                            <p className="text-[10px] font-black text-gray-500 tracking-[0.2em] mt-1 bg-gray-800 px-2 py-0.5 rounded-full inline-block uppercase">Token: {queue.queueNumber}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-amber-500/70 uppercase">Est. Start</p>
                                            <p className="text-md font-black text-amber-500">{queue.estimatedStartTime || '--:--'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-6 text-xs font-bold text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <span className="text-amber-500">💈</span>
                                            {queue.barber?.name}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-amber-500">✂️</span>
                                            {queue.service?.name}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-amber-500">🕒</span>
                                            {queue.service?.duration} min
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {waitingQueues.length === 0 && inProgressQueues.length === 0 && (
                <div className="bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-700">
                    <div className="text-gray-500 text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Tidak Ada Antrian Aktif</h3>
                    <p className="text-gray-400">Semua antrian sudah selesai atau belum ada customer hari ini</p>
                </div>
            )}
        </div>
    );
};

export default QueueMonitor;
