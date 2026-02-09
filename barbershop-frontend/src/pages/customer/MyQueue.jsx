import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    ClockIcon,
    MapPinIcon,
    PhoneIcon,
    XCircleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useSocket } from '../../contexts/SocketContext';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';

const MyQueue = () => {
    const { socket } = useSocket();
    const [timeRemaining, setTimeRemaining] = useState(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Fetch current queue
    const { data: queue, isLoading, refetch } = useQuery({
        queryKey: ['myQueue'],
        queryFn: async () => {
            const { data } = await apiClient.get('/queues/my-queue');
            return data.data;
        },
        refetchInterval: 30000 // Refetch every 30 seconds as fallback
    });

    // Setup Socket.IO for real-time updates
    useEffect(() => {
        if (socket && queue) {
            const room = `queue:${queue.id}`;
            socket.emit('join-room', room);

            socket.on('queue:updated', (updatedQueue) => {
                console.log('Queue updated:', updatedQueue);
                queryClient.setQueryData(['myQueue'], updatedQueue);
                toast('Update Antrian!', { icon: '⏰' });
            });

            socket.on('queue:status_changed', (updatedQueue) => {
                queryClient.setQueryData(['myQueue'], updatedQueue);

                if (updatedQueue.status === 'CALLED') {
                    toast.success('Giliran Anda! Silakan menuju kursi barber.', { duration: 5000 });
                } else if (updatedQueue.status === 'IN_PROGRESS') {
                    toast.success('Service dimulai!');
                }
            });

            return () => {
                socket.off('queue:updated');
                socket.off('queue:status_changed');
            };
        }
    }, [socket, queue?.id, queryClient]);

    // Countdown timer
    useEffect(() => {
        if (queue?.estimatedStart) {
            const interval = setInterval(() => {
                const now = new Date().getTime();
                const estimatedTime = new Date(queue.estimatedStart).getTime();
                const difference = estimatedTime - now;

                if (difference > 0) {
                    const hours = Math.floor(difference / (1000 * 60 * 60));
                    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                    setTimeRemaining({ hours, minutes, seconds });
                } else {
                    setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [queue?.estimatedStart]);

    // Cancel queue mutation
    const cancelQueueMutation = useMutation({
        mutationFn: async (queueId) => {
            const { data } = await apiClient.delete(`/queues/${queueId}`);
            return data;
        },
        onSuccess: () => {
            toast.success('Antrian berhasil dibatalkan');
            queryClient.invalidateQueries(['myQueue']);
            navigate('/customer');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error?.message || 'Gagal membatalkan antrian');
        }
    });

    const handleCancelQueue = () => {
        if (window.confirm('Apakah Anda yakin ingin membatalkan antrian?')) {
            cancelQueueMutation.mutate(queue.id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-amber-500 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!queue) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20 px-4">
                <div className="glass-card rounded-[3rem] p-16 border border-gray-700/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                    <div className="text-gray-600 text-8xl mb-8 animate-bounce">📋</div>
                    <h2 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">Antrian Kosong</h2>
                    <p className="text-gray-500 font-bold mb-10 max-w-sm mx-auto">Anda belum memiliki antrian aktif saat ini. Yuk, cari barbershop dan booking sekarang!</p>
                    <button
                        onClick={() => navigate('/customer')}
                        className="btn-premium px-10 py-4 text-lg"
                    >
                        Cari Barbershop Terbaik
                    </button>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        const badges = {
            WAITING: { text: 'Waiting', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
            CALLED: { text: 'Called', color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' },
            IN_PROGRESS: { text: 'In Service', color: 'bg-emerald-500 text-white border-emerald-500 shadow-glow-green' },
        };
        return badges[status] || badges.WAITING;
    };

    const statusBadge = getStatusBadge(queue.status);

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Antrian <span className="text-gradient-amber">Saya</span>
                    </h1>
                    <p className="text-gray-500 font-bold mt-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                        Real-time tracking status antrian Anda
                    </p>
                </div>
                <button
                    onClick={refetch}
                    className="p-3 bg-gray-800/50 rounded-2xl border border-gray-700/50 text-gray-400 hover:text-amber-500 hover:border-amber-500/40 transition-all group"
                    title="Refresh Status"
                >
                    <ArrowPathIcon className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
                </button>
            </div>

            {/* Main Queue Card */}
            <div className="glass-card rounded-[3rem] p-10 mb-10 border border-gray-700/50 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>

                {/* Queue Number & Status */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="bg-amber-500/10 p-4 rounded-3xl border border-amber-500/20">
                            <h2 className="text-7xl font-black text-amber-500 drop-shadow-glow-amber tracking-tighter">{queue.queueNumber}</h2>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Queue Number</p>
                            <h3 className="text-2xl font-black text-white tracking-tight">Your Turn is Near!</h3>
                        </div>
                    </div>
                    <span className={`px-6 py-2 ${statusBadge.color} rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border self-start md:self-center`}>
                        {statusBadge.text}
                    </span>
                </div>

                {/* Position Info */}
                <div className="bg-gray-900/50 border border-gray-800/50 backdrop-blur-md rounded-[2.5rem] p-8 mb-10 relative z-10">
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Your Position</p>
                            <h4 className="text-5xl font-black text-white tracking-tighter">#{queue.positionInQueue || 1}</h4>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Overall Queue</p>
                            <p className="text-xl font-black text-gray-400">{queue.totalQueueCount || 1} Total</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-800 rounded-full h-4 relative overflow-hidden ring-4 ring-gray-950/20">
                        <div
                            className="bg-gradient-to-r from-amber-600 to-amber-400 rounded-full h-4 transition-all duration-1000 shadow-glow-amber relative"
                            style={{ width: `${Math.max(10, ((queue.totalQueueCount - (queue.positionInQueue || 1) + 1) / queue.totalQueueCount) * 100)}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Time Estimation */}
                {timeRemaining && (
                    <div className="text-center relative z-10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Estimated Wait Time</p>
                        <div className="flex items-center justify-center gap-6">
                            {timeRemaining.hours > 0 && (
                                <>
                                    <div className="bg-gray-900/40 border border-gray-800 p-4 rounded-3xl min-w-[90px]">
                                        <div className="text-4xl font-black text-white">{timeRemaining.hours}</div>
                                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">HRS</div>
                                    </div>
                                    <div className="text-3xl font-black text-amber-500/50 animate-pulse">:</div>
                                </>
                            )}
                            <div className="bg-gray-900/40 border border-gray-800 p-4 rounded-3xl min-w-[90px]">
                                <div className="text-4xl font-black text-white">{timeRemaining.minutes}</div>
                                <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">MIN</div>
                            </div>
                            <div className="text-3xl font-black text-amber-500/50 animate-pulse">:</div>
                            <div className="bg-gray-900/40 border border-gray-800 p-4 rounded-3xl min-w-[90px]">
                                <div className="text-4xl font-black text-amber-500 drop-shadow-glow-amber">{String(timeRemaining.seconds).padStart(2, '0')}</div>
                                <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">SEC</div>
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-amber-500/70 mt-8 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                            <ClockIcon className="h-4 w-4" />
                            Ready approx by {new Date(queue.estimatedStart).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                )}
            </div>

            {/* Barbershop Info */}
            <div className="glass-card rounded-[2.5rem] p-10 mb-10 border border-gray-700/50 shadow-2xl relative">
                <h3 className="text-xl font-black text-white mb-8 border-b border-gray-800 pb-4 uppercase tracking-[0.2em]">Booking Details</h3>

                <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Barbershop</p>
                            <h4 className="text-2xl font-black text-amber-500 tracking-tight">{queue.barbershop?.name}</h4>
                            <div className="flex items-start gap-3 mt-4">
                                <MapPinIcon className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-gray-400 leading-relaxed">{queue.barbershop?.address}</p>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${queue.barbershop?.latitude},${queue.barbershop?.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-black text-amber-500 hover:text-amber-400 uppercase tracking-widest mt-3 inline-block transition-colors"
                                    >
                                        Open in Google Maps →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Master Barber</p>
                                <p className="font-black text-gray-200 uppercase tracking-tight">{queue.barber?.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Package</p>
                                <p className="font-black text-gray-200 uppercase tracking-tight">{queue.service?.name}</p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-950 p-3 rounded-2xl border border-gray-800">
                                    <PhoneIcon className="h-5 w-5 text-amber-500" />
                                </div>
                                <a href={`tel:${queue.barbershop?.phoneNumber}`} className="text-sm font-black text-gray-300 hover:text-white transition-colors">
                                    {queue.barbershop?.phoneNumber}
                                </a>
                            </div>
                            <a
                                href={`https://wa.me/${queue.barbershop?.phoneNumber?.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-lg"
                            >
                                WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Queues Ahead */}
            {queue.queuesAhead && queue.queuesAhead.length > 0 && (
                <div className="glass-card rounded-[2.5rem] p-10 mb-10 border border-gray-700/50 shadow-2xl">
                    <h3 className="text-xl font-black text-white mb-8 uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                        Next in Line
                    </h3>
                    <div className="space-y-4">
                        {queue.queuesAhead.map((q, index) => (
                            <div key={q.id} className="flex items-center justify-between p-6 bg-gray-950/40 rounded-3xl border border-gray-800/50 group/item hover:border-amber-500/30 transition-all duration-300">
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${q.status === 'IN_PROGRESS' ? 'bg-emerald-500 text-white shadow-emerald-900/40' : 'bg-gray-800 text-gray-500 shadow-gray-950/40'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Queue ID</p>
                                        <p className="text-lg font-black text-white group-hover/item:text-amber-500 transition-colors uppercase tracking-tight">{q.queueNumber}</p>
                                        <p className="text-[10px] font-bold text-gray-600 mt-1 uppercase tracking-widest">{q.service?.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Duration</p>
                                    <p className="text-lg font-black text-gray-300">~{q.service?.duration}m</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cancel Button */}
            {queue.status === 'WAITING' && (
                <button
                    onClick={handleCancelQueue}
                    disabled={cancelQueueMutation.isPending}
                    className="w-full bg-red-500/10 text-red-500 border-2 border-red-500/20 py-6 rounded-3xl font-black text-sm uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 duration-300"
                >
                    <XCircleIcon className="h-6 w-6" />
                    {cancelQueueMutation.isPending ? 'Processing...' : 'Cancel Appointment'}
                </button>
            )}
        </div>
    );
};

export default MyQueue;
