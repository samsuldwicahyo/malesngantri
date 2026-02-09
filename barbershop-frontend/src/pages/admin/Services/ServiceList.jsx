import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    PlusCircleIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../../api/axios';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ServiceList = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();

    // Fetch services
    const { data: services, isLoading } = useQuery({
        queryKey: ['services', user?.barbershop?.id, searchQuery],
        queryFn: async () => {
            const params = { search: searchQuery || undefined };
            const { data } = await apiClient.get(`/barbershops/${user.barbershop.id}/services`, { params });
            return data.data;
        },
        enabled: !!user?.barbershop?.id
    });

    // Delete service mutation
    const deleteServiceMutation = useMutation({
        mutationFn: async (serviceId) => {
            await apiClient.delete(`/services/${serviceId}`);
        },
        onSuccess: () => {
            toast.success('Layanan berhasil dihapus');
            queryClient.invalidateQueries(['services']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error?.message || 'Gagal menghapus layanan');
        }
    });

    const handleDelete = (service) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus layanan "${service.name}"?`)) {
            deleteServiceMutation.mutate(service.id);
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
                    <h1 className="text-3xl font-bold text-white">Service Management</h1>
                    <p className="text-gray-400 mt-1">Kelola layanan yang tersedia di barbershop Anda</p>
                </div>

                <Link
                    to="/admin/services/add"
                    className="btn-premium px-8 py-3.5 text-lg"
                >
                    <PlusCircleIcon className="h-6 w-6" />
                    Tambah Layanan Baru
                </Link>
            </div>

            {/* Search */}
            <div className="glass-card p-6 rounded-2xl border border-gray-700/50">
                <div className="relative group">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-amber-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari nama layanan atau deskripsi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-900/50 border border-gray-700 shadow-inner rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Services Table */}
            {services && services.length > 0 ? (
                <div className="glass-card rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700/50">
                                    <th className="text-left py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Layanan</th>
                                    <th className="text-center py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Harga</th>
                                    <th className="text-center py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Durasi</th>
                                    <th className="text-center py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Kategori</th>
                                    <th className="text-center py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {services.map((service) => (
                                    <tr key={service.id} className="hover:bg-gray-700/30 transition-colors group">
                                        <td className="py-5 px-6">
                                            <div>
                                                <p className="font-black text-white group-hover:text-amber-500 transition-colors">{service.name}</p>
                                                <p className="text-xs font-bold text-gray-500 tracking-tight mt-1">{service.description}</p>
                                            </div>
                                        </td>
                                        <td className="text-center py-5 px-6">
                                            <span className="text-lg font-black text-amber-500">
                                                Rp {service.price.toLocaleString('id-ID')}
                                            </span>
                                        </td>
                                        <td className="text-center py-5 px-6">
                                            <div className="flex items-center justify-center gap-2 text-gray-300">
                                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                                                <span className="text-sm font-bold">{service.duration} min</span>
                                            </div>
                                        </td>
                                        <td className="text-center py-5 px-6">
                                            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                                                {service.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="text-center py-5 px-6">
                                            <div className="flex items-center justify-center gap-3">
                                                <Link
                                                    to={`/admin/services/${service.id}/edit`}
                                                    className="bg-gray-800 text-gray-400 p-2.5 rounded-xl hover:text-amber-500 hover:bg-gray-700 transition-all border border-gray-700/50 shadow-lg"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(service)}
                                                    disabled={deleteServiceMutation.isPending}
                                                    className="bg-red-500/10 text-red-500 p-2.5 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20 disabled:opacity-50"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-700">
                    <div className="text-gray-500 text-6xl mb-4">✂️</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Layanan</h3>
                    <p className="text-gray-400 mb-6">Tambahkan layanan pertama Anda untuk memulai</p>
                    <Link
                        to="/admin/services/add"
                        className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition shadow-lg shadow-amber-900/20"
                    >
                        <PlusCircleIcon className="h-5 w-5" />
                        Tambah Layanan Baru
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ServiceList;
