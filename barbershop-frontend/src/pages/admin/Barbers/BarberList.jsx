import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    PlusCircleIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../../api/axios';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const BarberList = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const queryClient = useQueryClient();

    // Fetch barbers
    const { data: barbers, isLoading } = useQuery({
        queryKey: ['barbers', user?.barbershop?.id, searchQuery, statusFilter],
        queryFn: async () => {
            const params = {
                search: searchQuery || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined
            };
            const { data } = await apiClient.get(`/barbershops/${user.barbershop.id}/barbers`, { params });
            return data.data;
        },
        enabled: !!user?.barbershop?.id
    });

    // Delete barber mutation
    const deleteBarberMutation = useMutation({
        mutationFn: async (barberId) => {
            await apiClient.delete(`/barbers/${barberId}`);
        },
        onSuccess: () => {
            toast.success('Barber berhasil dihapus');
            queryClient.invalidateQueries(['barbers']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error?.message || 'Gagal menghapus barber');
        }
    });

    const handleDelete = (barber) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus barber "${barber.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
            deleteBarberMutation.mutate(barber.id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Barber Management</h1>
                    <p className="text-gray-400 mt-1">Kelola barber di barbershop Anda</p>
                </div>

                <Link
                    to="/admin/barbers/add"
                    className="btn-premium px-8 py-3.5 text-lg"
                >
                    <PlusCircleIcon className="h-6 w-6" />
                    Tambah Barber Baru
                </Link>
            </div>

            {/* Filters */}
            <div className="glass-card p-6 rounded-2xl border border-gray-700/50">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Search */}
                    <div className="relative group">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari nama atau spesialisasi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-900/50 border border-gray-700 shadow-inner rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative group">
                        <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-amber-500 transition-colors" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-900/50 border border-gray-700 shadow-inner text-white rounded-xl focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all outline-none appearance-none cursor-pointer"
                        >
                            <option value="all">Semua Status</option>
                            <option value="AVAILABLE">Available Now</option>
                            <option value="ON_BREAK">Taking a Break</option>
                            <option value="OFFLINE">Offline / Inactive</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            ▼
                        </div>
                    </div>
                </div>
            </div>

            {/* Barber Grid */}
            {barbers && barbers.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {barbers.map((barber) => (
                        <div key={barber.id} className="glass-card group hover:scale-[1.02] transition-all duration-300 rounded-3xl overflow-hidden border border-gray-700/50 shadow-2xl flex flex-col">
                            {/* Barber Photo */}
                            <div className="relative h-56">
                                <img
                                    src={barber.photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(barber.name) + '&background=f59e0b&color=fff&size=512'}
                                    alt={barber.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/20 to-transparent"></div>
                                <div className="absolute top-4 right-4">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border backdrop-blur-md ${barber.status === 'AVAILABLE' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        barber.status === 'ON_BREAK' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-gray-800/80 text-gray-400 border-gray-700'
                                        }`}>
                                        {barber.status || 'OFFLINE'}
                                    </span>
                                </div>
                            </div>

                            {/* Barber Info */}
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-2xl font-black text-white group-hover:text-amber-500 transition-colors">{barber.name}</h3>
                                <p className="text-sm font-bold text-gray-400 mb-6 flex items-center gap-2 italic">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                                    {barber.specialization || 'Master Barber'}
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 p-4 bg-gray-900/50 rounded-2xl border border-gray-800/50 mb-6">
                                    <div className="text-center">
                                        <p className="text-xl font-black text-white">{barber.rating?.toFixed(1) || '0.0'}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rating</p>
                                    </div>
                                    <div className="text-center border-x border-gray-800/50">
                                        <p className="text-xl font-black text-white">{barber.totalCustomers || 0}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Clients</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-black text-white">{barber.yearsOfExperience || 0}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Years</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 mt-auto">
                                    <Link
                                        to={`/admin/barbers/${barber.id}`}
                                        className="flex-1 bg-amber-500/10 text-amber-500 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-500/20 border border-amber-500/20 transition-all text-center"
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to={`/admin/barbers/${barber.id}/edit`}
                                        className="bg-gray-800 text-gray-400 p-3 rounded-xl hover:text-white hover:bg-gray-700 transition-all border border-gray-700/50"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(barber)}
                                        disabled={deleteBarberMutation.isPending}
                                        className="bg-red-500/10 text-red-500 p-3 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20 disabled:opacity-50"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-700">
                    <div className="text-gray-500 text-6xl mb-4">👤</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Barber</h3>
                    <p className="text-gray-400 mb-6">Tambahkan barber pertama Anda untuk memulai</p>
                    <Link
                        to="/admin/barbers/add"
                        className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition shadow-lg shadow-amber-900/20"
                    >
                        <PlusCircleIcon className="h-5 w-5" />
                        Tambah Barber Baru
                    </Link>
                </div>
            )}
        </div>
    );
};

export default BarberList;
