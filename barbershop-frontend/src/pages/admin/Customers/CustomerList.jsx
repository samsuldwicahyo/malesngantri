import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import apiClient from '../../../api/axios';
import { useAuth } from '../../../contexts/AuthContext';

const CustomerList = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent');

    // Fetch customers
    const { data: customers, isLoading } = useQuery({
        queryKey: ['customers', user?.barbershop?.id, searchQuery, sortBy],
        queryFn: async () => {
            const params = {
                search: searchQuery || undefined,
                sortBy
            };
            const { data } = await apiClient.get(`/barbershops/${user.barbershop.id}/customers`, { params });
            return data.data;
        },
        enabled: !!user?.barbershop?.id
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Customer Database</h1>
                <p className="text-gray-600 mt-1">Lihat semua customer yang pernah menggunakan layanan Anda</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="relative">
                        <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="recent">Terbaru</option>
                            <option value="frequent">Paling Sering</option>
                            <option value="name">Nama (A-Z)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Customer Table */}
            {customers && customers.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Customer</th>
                                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Total Visits</th>
                                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Total Spent</th>
                                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Last Visit</th>
                                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Avg. Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-blue-600 font-bold">
                                                        {customer.fullName?.[0]?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{customer.fullName}</p>
                                                    <p className="text-sm text-gray-500">{customer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center py-4 px-6 font-semibold text-gray-900">
                                            {customer.totalVisits || 0}
                                        </td>
                                        <td className="text-center py-4 px-6 font-semibold text-gray-900">
                                            Rp {(customer.totalSpent || 0).toLocaleString('id-ID')}
                                        </td>
                                        <td className="text-center py-4 px-6 text-gray-700">
                                            {customer.lastVisit
                                                ? new Date(customer.lastVisit).toLocaleDateString('id-ID')
                                                : '-'
                                            }
                                        </td>
                                        <td className="text-center py-4 px-6">
                                            <span className="text-yellow-500">
                                                ⭐ {customer.avgRating?.toFixed(1) || '-'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="text-gray-400 text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Customer</h3>
                    <p className="text-gray-500">Customer akan muncul di sini setelah melakukan booking</p>
                </div>
            )}
        </div>
    );
};

export default CustomerList;
