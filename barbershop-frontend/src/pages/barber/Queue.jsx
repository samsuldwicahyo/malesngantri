import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    PlayIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserGroupIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';

const Queue = ({ barberId }) => {
    const [serviceTimer, setServiceTimer] = useState(0);
    const queryClient = useQueryClient();

    // Fetch today's queues
    const { data: queues, isLoading } = useQuery({
        queryKey: ['barberQueues', barberId],
        queryFn: async () => {
            const today = new Date().toISOString().split('T')[0];
            const { data } = await apiClient.get(`/barbers/${barberId}/queues`, {
                params: { date: today }
            });
            return data.data;
        },
        enabled: !!barberId,
        refetchInterval: 30000 // Refetch every 30 seconds as fallback
    });

    const currentQueue = queues?.find(q => q.status === 'IN_PROGRESS');
    const waitingQueues = queues?.filter(q => q.status === 'WAITING') || [];
    const completedToday = queues?.filter(q => q.status === 'COMPLETED').length || 0;
    const cancelledToday = queues?.filter(q => q.status === 'CANCELLED').length || 0;

    // Calculate average service time
    const completedQueues = queues?.filter(q => q.status === 'COMPLETED' && q.actualDuration) || [];
    const avgServiceTime = completedQueues.length > 0
        ? Math.round(completedQueues.reduce((sum, q) => sum + q.actualDuration, 0) / completedQueues.length)
        : 0;

    // Timer for current service
    useEffect(() => {
        let interval;
        if (currentQueue?.actualStart) {
            interval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - new Date(currentQueue.actualStart).getTime()) / 1000);
                setServiceTimer(elapsed);
            }, 1000);
        } else {
            setServiceTimer(0);
        }
        return () => clearInterval(interval);
    }, [currentQueue]);

    // Start service mutation
    const startServiceMutation = useMutation({
        mutationFn: async (queueId) => {
            const { data } = await apiClient.patch(`/queues/${queueId}/start`);
            return data.data;
        },
        onSuccess: () => {
            toast.success('Service dimulai! Timer berjalan.');
            queryClient.invalidateQueries(['barberQueues']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error?.message || 'Gagal memulai service');
        }
    });

    // Complete service mutation
    const completeServiceMutation = useMutation({
        mutationFn: async (queueId) => {
            const { data } = await apiClient.patch(`/queues/${queueId}/complete`);
            return data.data;
        },
        onSuccess: () => {
            toast.success('Service selesai! Customer akan menerima request rating via WhatsApp.');
            queryClient.invalidateQueries(['barberQueues']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error?.message || 'Gagal menyelesaikan service');
        }
    });

    // Cancel queue mutation
    const cancelQueueMutation = useMutation({
        mutationFn: async ({ queueId, reason }) => {
            const { data } = await apiClient.delete(`/queues/${queueId}`, {
                data: { reason }
            });
            return data.data;
        },
        onSuccess: () => {
            toast.success('Antrian dibatalkan');
            queryClient.invalidateQueries(['barberQueues']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error?.message || 'Gagal membatalkan antrian');
        }
    });

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-amber-500 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Stats Summary */}
            <div className="grid md:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-3xl border border-gray-700/50 group hover:border-amber-500/30 transition-all duration-300">
                    <div className="flex items-center gap-5">
                        <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                            <UserGroupIcon className="h-7 w-7 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Waiting</p>
                            <p className="text-3xl font-black text-white">{waitingQueues.length}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-gray-700/50 group hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex items-center gap-5">
                        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                            <CheckCircleIcon className="h-7 w-7 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Completed</p>
                            <p className="text-3xl font-black text-white">{completedToday}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-gray-700/50 group hover:border-purple-500/30 transition-all duration-300">
                    <div className="flex items-center gap-5">
                        <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
                            <ClockIcon className="h-7 w-7 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Avg Time</p>
                            <p className="text-3xl font-black text-white">{avgServiceTime}<span className="text-sm text-gray-500 ml-1">min</span></p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-gray-700/50 group hover:border-red-500/30 transition-all duration-300">
                    <div className="flex items-center gap-5">
                        <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                            <XCircleIcon className="h-7 w-7 text-red-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Cancelled</p>
                            <p className="text-3xl font-black text-white">{cancelledToday}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Customer */}
            {currentQueue && (
                <div className="glass-card rounded-[3rem] p-10 border border-gray-700/50 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>

                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10 relative z-10">
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-glow-green"></span>
                                In Service Now
                            </p>
                            <h2 className="text-5xl font-black text-white mb-4 tracking-tight">{currentQueue.customerName}</h2>
                            <div className="flex flex-wrap items-center gap-6 text-gray-300">
                                <span className="flex items-center gap-2 text-sm font-bold">
                                    <span className="text-2xl">✂️</span>
                                    {currentQueue.service.name}
                                </span>
                                {currentQueue.customerPhone && (
                                    <a
                                        href={`tel:${currentQueue.customerPhone}`}
                                        className="flex items-center gap-2 text-sm font-bold hover:text-amber-500 transition-colors group/phone"
                                    >
                                        <div className="bg-gray-900/50 p-2 rounded-xl border border-gray-800 group-hover/phone:border-amber-500/50">
                                            <PhoneIcon className="h-4 w-4" />
                                        </div>
                                        {currentQueue.customerPhone}
                                    </a>
                                )}
                            </div>
                            <div className="mt-4 inline-block px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400">
                                {currentQueue.queueNumber}
                            </div>
                        </div>

                        <div className="bg-gray-900/50 border border-gray-800/50 backdrop-blur-md rounded-[2.5rem] p-8 text-center min-w-[240px] relative z-10">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Service Timer</p>
                            <p className="text-6xl font-black font-mono text-emerald-500 drop-shadow-glow-green tracking-tighter">{formatTime(serviceTimer)}</p>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-4">
                                Est. {currentQueue.service.duration} min
                            </p>
                            {serviceTimer > currentQueue.service.duration * 60 && (
                                <p className="text-xs font-black text-amber-500 mt-3 flex items-center justify-center gap-2">
                                    <span className="text-lg">⚠️</span> Over Estimate
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => completeServiceMutation.mutate(currentQueue.id)}
                        disabled={completeServiceMutation.isPending}
                        className="btn-premium w-full py-6 text-xl relative group/btn"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            <CheckCircleIcon className="h-7 w-7" />
                            {completeServiceMutation.isPending ? 'Processing...' : 'Complete & Call Next'}
                        </span>
                    </button>
                </div>
            )}

            {/* Waiting Queues */}
            <div className="glass-card rounded-[2.5rem] p-10 border border-gray-700/50 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-1 h-8 bg-amber-500 rounded-full"></span>
                        Waiting Queue
                    </h3>
                    {waitingQueues.length > 0 && (
                        <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs font-black uppercase tracking-widest text-amber-500">
                            {waitingQueues.length} Customers
                        </span>
                    )}
                </div>

                {waitingQueues.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-6 animate-bounce">
                            {completedToday > 0 ? '🎉' : '📋'}
                        </div>
                        <h4 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                            {completedToday > 0 ? 'All Done!' : 'No Queue Yet'}
                        </h4>
                        <p className="text-gray-500 font-bold max-w-md mx-auto">
                            {completedToday > 0
                                ? `Fantastic work! You've served ${completedToday} customers today. 👏`
                                : 'New customers will appear here when they join the queue'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {waitingQueues.map((queue, index) => (
                            <div
                                key={queue.id}
                                className="bg-gray-950/40 border-2 border-gray-800/50 rounded-3xl p-6 hover:border-amber-500/40 transition-all duration-300 group/item"
                            >
                                <div className="flex items-center gap-6">
                                    {/* Position Badge */}
                                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl flex-shrink-0 shadow-lg">
                                        {index + 1}
                                    </div>

                                    {/* Customer Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <h4 className="text-xl font-black text-white group-hover/item:text-amber-500 transition-colors uppercase tracking-tight">{queue.customerName}</h4>
                                            <span className="px-3 py-1 bg-gray-900/50 border border-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl">
                                                {queue.queueNumber}
                                            </span>
                                            {queue.bookingType === 'WALK_IN' && (
                                                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-500 text-[10px] font-black uppercase tracking-widest rounded-xl">
                                                    Walk-in
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                                            <span className="text-lg">✂️</span> {queue.service.name}
                                        </p>
                                        <div className="flex items-center gap-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                            <span className="flex items-center gap-1">
                                                <ClockIcon className="h-3.5 w-3.5 text-amber-500" />
                                                {queue.service.duration} min
                                            </span>
                                            <span>•</span>
                                            <span>
                                                Est. {new Date(queue.estimatedStart).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {queue.customerPhone && (
                                                <>
                                                    <span>•</span>
                                                    <a
                                                        href={`tel:${queue.customerPhone}`}
                                                        className="flex items-center gap-1 hover:text-amber-500 transition-colors"
                                                    >
                                                        <PhoneIcon className="h-3.5 w-3.5" />
                                                        {queue.customerPhone}
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 flex-shrink-0">
                                        {index === 0 && !currentQueue && (
                                            <button
                                                onClick={() => startServiceMutation.mutate(queue.id)}
                                                disabled={startServiceMutation.isPending}
                                                className="bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg"
                                            >
                                                <PlayIcon className="h-5 w-5" />
                                                Start
                                            </button>
                                        )}

                                        <button
                                            onClick={() => {
                                                const reason = prompt('Reason for cancellation:');
                                                if (reason) {
                                                    cancelQueueMutation.mutate({ queueId: queue.id, reason });
                                                }
                                            }}
                                            disabled={cancelQueueMutation.isPending}
                                            className="border-2 border-red-500/20 bg-red-500/10 text-red-500 p-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                            title="Cancel queue"
                                        >
                                            <XCircleIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Tips */}
            {waitingQueues.length > 0 && !currentQueue && (
                <div className="glass-card p-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                    <p className="text-sm font-bold text-amber-500/90 flex items-center gap-3">
                        <span className="text-2xl">💡</span>
                        <span className="uppercase tracking-wider"><strong className="font-black">Tip:</strong> Click "Start" on the first queue to begin service. Timer will auto-start.</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default Queue;
