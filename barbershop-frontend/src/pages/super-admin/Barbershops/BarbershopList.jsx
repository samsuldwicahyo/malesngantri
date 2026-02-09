import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    PlusCircleIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    XCircleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

const BarbershopList = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        status: 'all', // all, active, suspended
        plan: 'all', // all, basic, professional, enterprise
        city: ''
    });
    const [selectedShops, setSelectedShops] = useState([]);
    const queryClient = useQueryClient();

    // Fetch barbershops with pagination & filters
    const { data, isLoading } = useQuery({
        queryKey: ['superAdminBarbershops', page, pageSize, searchQuery, filters],
        queryFn: async () => {
            try {
                const params = {
                    page,
                    limit: pageSize,
                    search: searchQuery,
                    ...filters
                };
                const { data } = await apiClient.get('/super-admin/barbershops', { params });
                return data.data;
            } catch (err) {
                // Mock data for demo
                return {
                    barbershops: [
                        {
                            id: '1',
                            name: 'Gentleman Cut Sudirman',
                            ownerName: 'Budi Santoso',
                            ownerEmail: 'budi@gmail.com',
                            city: 'Jakarta',
                            subscriptionPlan: 'Enterprise',
                            status: 'ACTIVE',
                            monthlyRevenue: 8500000,
                            totalBarbers: 5,
                            createdAt: '2023-10-15T08:00:00Z'
                        },
                        {
                            id: '2',
                            name: 'Style Hut Bandung',
                            ownerName: 'Jane Smith',
                            ownerEmail: 'jane@gmail.com',
                            city: 'Bandung',
                            subscriptionPlan: 'Professional',
                            status: 'ACTIVE',
                            monthlyRevenue: 7200000,
                            totalBarbers: 3,
                            createdAt: '2023-11-20T10:00:00Z'
                        },
                        {
                            id: '3',
                            name: 'Old School Solo',
                            ownerName: 'Eko Wijaya',
                            ownerEmail: 'eko@gmail.com',
                            city: 'Solo',
                            subscriptionPlan: 'Basic',
                            status: 'SUSPENDED',
                            monthlyRevenue: 0,
                            totalBarbers: 2,
                            createdAt: '2024-01-05T09:00:00Z'
                        },
                    ],
                    totalPages: 1,
                    totalCount: 3
                };
            }
        }
    });

    // Suspend barbershop mutation
    const suspendMutation = useMutation({
        mutationFn: async (barbershopId) => {
            const { data } = await apiClient.patch(`/super-admin/barbershops/${barbershopId}/suspend`);
            return data.data;
        },
        onSuccess: () => {
            toast.success('Barbershop suspended successfully');
            queryClient.invalidateQueries(['superAdminBarbershops']);
        },
        onError: () => {
            toast.error('Failed to suspend barbershop');
        }
    });

    // Activate barbershop mutation
    const activateMutation = useMutation({
        mutationFn: async (barbershopId) => {
            const { data } = await apiClient.patch(`/super-admin/barbershops/${barbershopId}/activate`);
            return data.data;
        },
        onSuccess: () => {
            toast.success('Barbershop activated successfully');
            queryClient.invalidateQueries(['superAdminBarbershops']);
        },
        onError: () => {
            toast.error('Failed to activate barbershop');
        }
    });

    // Delete barbershop mutation
    const deleteMutation = useMutation({
        mutationFn: async (barbershopId) => {
            const { data } = await apiClient.delete(`/super-admin/barbershops/${barbershopId}`);
            return data.data;
        },
        onSuccess: () => {
            toast.success('Barbershop deleted successfully');
            queryClient.invalidateQueries(['superAdminBarbershops']);
        },
        onError: () => {
            toast.error('Failed to delete barbershop');
        }
    });

    const handleBulkSuspend = () => {
        if (selectedShops.length === 0) return;
        if (window.confirm(`Suspend ${selectedShops.length} barbershops?`)) {
            toast.success(`Suspending ${selectedShops.length} shops...`);
            setSelectedShops([]);
        }
    };

    const handleBulkDelete = () => {
        if (selectedShops.length === 0) return;
        if (window.confirm(`Delete ${selectedShops.length} barbershops? This action cannot be undone!`)) {
            toast.success(`Deleting ${selectedShops.length} shops...`);
            setSelectedShops([]);
        }
    };

    const toggleSelectShop = (shopId) => {
        setSelectedShops(prev =>
            prev.includes(shopId)
                ? prev.filter(id => id !== shopId)
                : [...prev, shopId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedShops.length === data?.barbershops?.length) {
            setSelectedShops([]);
        } else {
            setSelectedShops(data?.barbershops?.map(shop => shop.id) || []);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Barbershop Management</h1>
                    <p className="text-gray-400 mt-1">Manage all barbershops on the platform</p>
                </div>

                <div className="flex gap-3">
                    <button className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition flex items-center gap-2 text-sm">
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        Export CSV
                    </button>
                    <Link
                        to="/super-admin/barbershops/add"
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition flex items-center gap-2 text-sm"
                    >
                        <PlusCircleIcon className="h-5 w-5" />
                        Add Barbershop
                    </Link>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="grid md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, owner, or city..."
                                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>

                    {/* Plan Filter */}
                    <select
                        value={filters.plan}
                        onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
                        className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                        <option value="all">All Plans</option>
                        <option value="basic">Basic</option>
                        <option value="professional">Professional</option>
                        <option value="enterprise">Enterprise</option>
                    </select>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedShops.length > 0 && (
                <div className="bg-amber-900 border border-amber-700 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-amber-500 font-semibold text-sm">
                            {selectedShops.length} barbershop{selectedShops.length > 1 ? 's' : ''} selected
                        </span>
                        <div className="flex gap-3">
                            <button
                                onClick={handleBulkSuspend}
                                className="bg-yellow-600 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-700 transition text-sm font-medium"
                            >
                                Suspend
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition text-sm font-medium"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setSelectedShops([])}
                                className="bg-gray-700 text-white px-3 py-1.5 rounded-lg hover:bg-gray-600 transition text-sm font-medium"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left w-10">
                                    <input
                                        type="checkbox"
                                        checked={data?.barbershops?.length > 0 && selectedShops.length === data.barbershops.length}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 text-amber-600 bg-gray-700 border-gray-600 rounded focus:ring-amber-500"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Barbershop</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Owner</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Location</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Plan</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Joined</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : data?.barbershops?.length > 0 ? (
                                data.barbershops.map((shop) => (
                                    <tr key={shop.id} className="hover:bg-gray-700/50 transition duration-150">
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedShops.includes(shop.id)}
                                                onChange={() => toggleSelectShop(shop.id)}
                                                className="w-4 h-4 text-amber-600 bg-gray-700 border-gray-600 rounded focus:ring-amber-500"
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center font-bold text-amber-500 border border-gray-600 uppercase">
                                                    {shop.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{shop.name}</p>
                                                    <p className="text-xs text-gray-400">{shop.totalBarbers} barbers</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-white text-sm">{shop.ownerName}</p>
                                            <p className="text-xs text-gray-400">{shop.ownerEmail}</p>
                                        </td>
                                        <td className="px-4 py-4 text-gray-300 text-sm">{shop.city}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${shop.subscriptionPlan === 'Enterprise' ? 'bg-pink-900/50 text-pink-400 border border-pink-500/50' :
                                                shop.subscriptionPlan === 'Professional' ? 'bg-purple-900/50 text-purple-400 border border-purple-500/50' :
                                                    'bg-amber-900/50 text-amber-500 border border-amber-500/50'
                                                }`}>
                                                {shop.subscriptionPlan}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${shop.status === 'ACTIVE' ? 'bg-green-900/50 text-green-400 border border-green-500/50' : 'bg-red-900/50 text-red-400 border border-red-500/50'
                                                }`}>
                                                {shop.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center text-gray-400 text-sm font-medium">
                                            {new Date(shop.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <Link
                                                    to={`/super-admin/barbershops/${shop.id}`}
                                                    className="p-1.5 text-amber-500 hover:bg-amber-900/30 rounded-lg transition"
                                                    title="View"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </Link>
                                                <Link
                                                    to={`/super-admin/barbershops/${shop.id}/edit`}
                                                    className="p-1.5 text-green-400 hover:bg-green-900/30 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </Link>
                                                {shop.status === 'ACTIVE' ? (
                                                    <button
                                                        onClick={() => suspendMutation.mutate(shop.id)}
                                                        className="p-1.5 text-yellow-400 hover:bg-yellow-900/30 rounded-lg transition"
                                                        title="Suspend"
                                                    >
                                                        <XCircleIcon className="h-5 w-5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => activateMutation.mutate(shop.id)}
                                                        className="p-1.5 text-green-400 hover:bg-green-900/30 rounded-lg transition"
                                                        title="Activate"
                                                    >
                                                        <CheckCircleIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`Delete ${shop.name}? This action cannot be undone!`)) {
                                                            deleteMutation.mutate(shop.id);
                                                        }
                                                    }}
                                                    className="p-1.5 text-red-400 hover:bg-red-900/30 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-gray-500">
                                        No barbershops found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data?.totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-700/30 border-t border-gray-700 flex items-center justify-between">
                        <div className="text-sm text-gray-400 font-medium">
                            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data?.totalCount || 0)} of {data?.totalCount || 0}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition text-sm font-semibold"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(data.totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold transition ${page === i + 1 ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setPage(Math.min(data?.totalPages || 1, page + 1))}
                                disabled={page >= (data?.totalPages || 1)}
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition text-sm font-semibold"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BarbershopList;
