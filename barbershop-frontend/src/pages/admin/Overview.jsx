import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    CurrencyDollarIcon,
    UserGroupIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    PlusCircleIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';

const Overview = () => {
    const { user } = useAuth();

    // Fetch dashboard stats
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboardStats', user?.barbershop?.id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/barbershops/${user.barbershop.id}/stats`);
            return data.data;
        },
        enabled: !!user?.barbershop?.id
    });

    // Fetch today's queues
    const { data: todayQueues } = useQuery({
        queryKey: ['todayQueues', user?.barbershop?.id],
        queryFn: async () => {
            const today = new Date().toISOString().split('T')[0];
            const { data } = await apiClient.get(`/barbershops/${user.barbershop.id}/queues`, {
                params: { date: today }
            });
            return data.data;
        },
        enabled: !!user?.barbershop?.id
    });

    const activeQueues = todayQueues?.filter(q => ['WAITING', 'IN_PROGRESS'].includes(q.status)).length || 0;
    const completedToday = todayQueues?.filter(q => q.status === 'COMPLETED').length || 0;

    // Mock data untuk charts (dalam production, fetch dari API)
    const revenueData = [
        { name: 'Sen', revenue: 1200000 },
        { name: 'Sel', revenue: 1500000 },
        { name: 'Rab', revenue: 1300000 },
        { name: 'Kam', revenue: 1800000 },
        { name: 'Jum', revenue: 2000000 },
        { name: 'Sab', revenue: 2500000 },
        { name: 'Min', revenue: 2200000 },
    ];

    const serviceData = [
        { name: 'Haircut', count: 45 },
        { name: 'Shaving', count: 28 },
        { name: 'Coloring', count: 12 },
        { name: 'Treatment', count: 8 },
    ];

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
                    <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                    <p className="text-gray-400 mt-1">
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                    <Link
                        to="/admin/barbers/add"
                        className="btn-premium px-5 py-2.5 text-sm"
                    >
                        <PlusCircleIcon className="h-5 w-5" />
                        Tambah Barber
                    </Link>
                    <Link
                        to="/admin/services/add"
                        className="glass-card px-5 py-2.5 rounded-xl font-bold text-amber-500 hover:bg-amber-500/10 transition-all border-amber-500/30 flex items-center gap-2 text-sm shadow-lg shadow-amber-900/10"
                    >
                        <PlusCircleIcon className="h-5 w-5" />
                        Tambah Layanan
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue Today */}
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20 group-hover:scale-110 transition-transform">
                            <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
                        </div>
                        <span className="text-xs font-bold bg-green-500/10 text-green-500 px-2.5 py-1 rounded-lg border border-green-500/20">
                            +12.5%
                        </span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Revenue Hari Ini</p>
                    <p className="text-3xl font-black text-white mt-2">
                        Rp {(stats?.revenueToday || 0).toLocaleString('id-ID')}
                    </p>
                </div>

                {/* Customers Today */}
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
                            <UserGroupIcon className="h-6 w-6 text-amber-500" />
                        </div>
                        <span className="text-xs font-bold bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            +5.2%
                        </span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Customers Hari Ini</p>
                    <p className="text-3xl font-black text-white mt-2">{completedToday}</p>
                </div>

                {/* Active Queues */}
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20 group-hover:scale-110 transition-transform">
                            <ClockIcon className="h-6 w-6 text-yellow-500" />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Antrian Aktif</p>
                    <p className="text-3xl font-black text-white mt-2">{activeQueues}</p>
                </div>

                {/* Average Rating */}
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20 group-hover:scale-110 transition-transform">
                            <ArrowTrendingUpIcon className="h-6 w-6 text-purple-500" />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Average Rating</p>
                    <p className="text-3xl font-black text-white mt-2">
                        {(stats?.averageRating || 0).toFixed(1)} <span className="text-amber-500 text-2xl">★</span>
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="glass-card p-6 rounded-2xl border border-gray-700/50">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                        Revenue This Week
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                                itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                                labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                                formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={4} dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Popular Services */}
                <div className="glass-card p-6 rounded-2xl border border-gray-700/50">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                        Popular Services
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={serviceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                                itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                                labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                            />
                            <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Barber Performance */}
            <div className="glass-card p-6 rounded-2xl border border-gray-700/50">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                        Barber Performance Today
                    </h3>
                    <Link to="/admin/barbers" className="text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/20">
                        Lihat Semua →
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700/50">
                                <th className="text-left py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Barber</th>
                                <th className="text-center py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Customers</th>
                                <th className="text-center py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Revenue</th>
                                <th className="text-center py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Avg. Time</th>
                                <th className="text-center py-4 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {stats?.barberPerformance?.map((barber) => (
                                <tr key={barber.id} className="hover:bg-gray-700/30 transition-colors group">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img
                                                    src={barber.photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(barber.name) + '&background=f59e0b&color=fff'}
                                                    alt={barber.name}
                                                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-gray-700 group-hover:ring-amber-500/50 transition-all"
                                                />
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${barber.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{barber.name}</p>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-amber-500 text-xs text-lg leading-none">★</span>
                                                    <p className="text-xs font-bold text-gray-400">{barber.rating?.toFixed(1) || '0.0'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center py-4 px-4">
                                        <span className="text-lg font-black text-white">{barber.customersToday || 0}</span>
                                    </td>
                                    <td className="text-center py-4 px-4">
                                        <span className="text-md font-bold text-amber-500">Rp {(barber.revenueToday || 0).toLocaleString('id-ID')}</span>
                                    </td>
                                    <td className="text-center py-4 px-4">
                                        <span className="text-sm font-medium text-gray-300">{barber.avgServiceTime || 0} min</span>
                                    </td>
                                    <td className="text-center py-4 px-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider ${barber.status === 'AVAILABLE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                            barber.status === 'ON_BREAK' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                'bg-gray-700/50 text-gray-400 border border-gray-600/50'
                                            }`}>
                                            {barber.status || 'OFFLINE'}
                                        </span>
                                    </td>
                                </tr>
                            )) || (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12">
                                            <div className="text-4xl mb-2">👤</div>
                                            <p className="text-gray-500 font-medium">No barber performance data available today.</p>
                                        </td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Overview;
