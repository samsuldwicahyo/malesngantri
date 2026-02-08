import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    PlusCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import toast from 'react-hot-toast';

// Sub pages
import Queue from './Queue';
import Schedule from './Schedule';
import Profile from './Profile';
import Stats from './Stats';

const BarberDashboard = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [currentStatus, setCurrentStatus] = useState('AVAILABLE');
    const [showAddWalkInModal, setShowAddWalkInModal] = useState(false);
    const queryClient = useQueryClient();

    // Fetch barber profile
    const { data: barberProfile } = useQuery({
        queryKey: ['barberProfile'],
        queryFn: async () => {
            const { data } = await apiClient.get('/barbers/me');
            return data.data;
        }
    });

    // Setup Socket.IO for barber-specific events
    useEffect(() => {
        if (socket && barberProfile) {
            const room = `barber:${barberProfile.id}`;
            socket.emit('join-room', room);

            socket.on('barber:queue:new', (queue) => {
                console.log('New queue:', queue);
                queryClient.invalidateQueries(['barberQueues']);

                // Sound notification
                toast('Antrian Baru Masuk! 🔔', {
                    icon: '👤',
                    duration: 4000
                });

                // Browser notification
                if (Notification.permission === 'granted') {
                    new Notification('Antrian Baru!', {
                        body: `${queue.customerName} telah masuk antrian`,
                        icon: '/logo.png'
                    });
                }

                // Play sound
                try {
                    const audio = new Audio('/notification.mp3');
                    audio.play().catch(e => console.log('Audio play failed:', e));
                } catch (e) {
                    console.log('Audio not available');
                }
            });

            socket.on('barber:queue:updated', (queue) => {
                console.log('Queue updated:', queue);
                queryClient.invalidateQueries(['barberQueues']);
            });

            socket.on('barber:queue:bulk_updated', (queues) => {
                console.log('Bulk queue update:', queues);
                queryClient.invalidateQueries(['barberQueues']);
            });

            return () => {
                socket.off('barber:queue:new');
                socket.off('barber:queue:updated');
                socket.off('barber:queue:bulk_updated');
            };
        }
    }, [socket, barberProfile?.id, queryClient]);

    // Request notification permission
    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Update barber status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async (status) => {
            const { data } = await apiClient.patch('/barbers/me/status', { status });
            return data.data;
        },
        onSuccess: (data) => {
            setCurrentStatus(data.status);
            toast.success(`Status diubah ke ${data.status}`);
            queryClient.invalidateQueries(['barberProfile']);
        },
        onError: () => {
            toast.error('Gagal mengubah status');
        }
    });

    const handleStatusChange = (status) => {
        updateStatusMutation.mutate(status);
    };

    // Set initial status from profile
    useEffect(() => {
        if (barberProfile?.status) {
            setCurrentStatus(barberProfile.status);
        }
    }, [barberProfile?.status]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Top Bar */}
            <header className="bg-gray-800 shadow-sm sticky top-0 z-10 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img
                                src={barberProfile?.photoUrl || '/placeholder-barber.jpg'}
                                alt={barberProfile?.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/30"
                                onError={(e) => {
                                    e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(barberProfile?.name || 'Barber');
                                }}
                            />
                            <div>
                                <h1 className="text-xl font-bold text-white">{barberProfile?.name}</h1>
                                <p className="text-sm text-gray-400">{barberProfile?.barbershop?.name}</p>
                            </div>
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400 hidden md:inline">Status:</span>
                            <select
                                value={currentStatus}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                disabled={updateStatusMutation.isPending}
                                className={`px-4 py-2 rounded-lg font-semibold border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-700 transition ${currentStatus === 'AVAILABLE'
                                    ? 'text-green-400 border-green-500/30 focus:ring-green-500'
                                    : currentStatus === 'ON_BREAK'
                                        ? 'text-amber-500 border-amber-500/30 focus:ring-amber-500'
                                        : 'text-gray-400 border-gray-500/30 focus:ring-gray-500'
                                    }`}
                            >
                                <option value="AVAILABLE">✅ Available</option>
                                <option value="ON_BREAK">☕ On Break</option>
                                <option value="OFFLINE">🔴 Offline</option>
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                <Routes>
                    <Route path="/" element={<Queue barberId={barberProfile?.id} />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/stats" element={<Stats />} />
                    <Route path="*" element={<Navigate to="/barber" replace />} />
                </Routes>
            </main>

            {/* Floating Add Walk-in Button */}
            <button
                onClick={() => setShowAddWalkInModal(true)}
                className="fixed bottom-6 right-6 bg-amber-600 text-white p-4 rounded-full shadow-lg hover:bg-amber-700 transition transform hover:scale-110 active:scale-95 z-40 shadow-amber-900/40"
                title="Tambah Customer Walk-in"
            >
                <PlusCircleIcon className="h-8 w-8" />
            </button>

            {/* Add Walk-in Modal */}
            {showAddWalkInModal && (
                <AddWalkInModal
                    barberId={barberProfile?.id}
                    onClose={() => setShowAddWalkInModal(false)}
                />
            )}
        </div>
    );
};

// Add Walk-in Modal Component
const AddWalkInModal = ({ barberId, onClose }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        serviceId: ''
    });
    const queryClient = useQueryClient();

    const { data: services } = useQuery({
        queryKey: ['barberServices', barberId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/barbers/${barberId}/services`);
            return data.data;
        },
        enabled: !!barberId
    });

    const addWalkInMutation = useMutation({
        mutationFn: async (data) => {
            const payload = {
                customerName: data.customerName,
                customerPhone: data.customerPhone || null,
                barberId,
                serviceId: data.serviceId,
                scheduledDate: new Date().toISOString().split('T')[0],
                bookingType: 'WALK_IN'
            };
            const response = await apiClient.post('/queues', payload);
            return response.data.data;
        },
        onSuccess: () => {
            toast.success('Customer walk-in berhasil ditambahkan ke antrian');
            queryClient.invalidateQueries(['barberQueues']);
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.error?.message || 'Gagal menambahkan walk-in');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addWalkInMutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 relative border border-gray-700">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-4">Tambah Customer Walk-in</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nama Customer <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Budi Santoso"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            No. Telepon (opsional)
                        </label>
                        <input
                            type="tel"
                            value={formData.customerPhone}
                            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="+62 812-3456-7890"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Opsional, untuk notifikasi WhatsApp
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Layanan <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.serviceId}
                            onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            required
                        >
                            <option value="">Pilih Layanan</option>
                            {services?.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.name} - Rp {service.price.toLocaleString('id-ID')} ({service.duration} menit)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg font-semibold text-gray-300 hover:bg-gray-600 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={addWalkInMutation.isPending}
                            className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {addWalkInMutation.isPending ? 'Menambahkan...' : 'Tambah ke Antrian'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BarberDashboard;
