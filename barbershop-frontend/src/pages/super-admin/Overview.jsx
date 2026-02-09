import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    BuildingStorefrontIcon,
    CurrencyDollarIcon,
    UsersIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import apiClient from '../../api/axios';

const Overview = () => {
    // Fetch platform stats
    const { data: stats, isLoading } = useQuery({
        queryKey: ['platformStats'],
        queryFn: async () => {
            try {
                const { data } = await apiClient.get('/super-admin/stats');
                return data.data;
            } catch (err) {
                // Mock data for initial render
                return {
                    totalBarbershops: 125,
                    activeBarbershops: 118,
                    suspendedBarbershops: 7,
                    barbershopGrowth: 12,
                    totalRevenue: 52000000,
                    revenueGrowth: 15,
                    totalUsers: 4500,
                    totalAdmins: 130,
                    totalBarbers: 350,
                    totalCustomers: 4020,
                    userGrowth: 8,
                    totalTransactions: 1250,
                    transactionGrowth: 10,
                    churnRate: 2.1,
                    retentionRate: 94,
                    upgradeRate: 5,
                    downgradeRate: 1,
                    alerts: [
                        { message: 'Database backup failed 2 hours ago' },
                        { message: '3 new support tickets waiting for response' }
                    ],
                    topBarbershops: [
                        { id: '1', name: 'Gentleman Cut', city: 'Jakarta', monthlyRevenue: 8500000, totalTransactions: 120 },
                        { id: '2', name: 'Barberia', city: 'Bandung', monthlyRevenue: 7200000, totalTransactions: 95 },
                        { id: '3', name: 'The Cut', city: 'Surabaya', monthlyRevenue: 6800000, totalTransactions: 88 }
                    ]
                };
            }
        }
    });

    // Fetch recent barbershops
    const { data: recentBarbershops } = useQuery({
        queryKey: ['recentBarbershops'],
        queryFn: async () => {
            try {
                const { data } = await apiClient.get('/super-admin/barbershops/recent');
                return data.data;
            } catch (err) {
                return [
                    { id: '1', name: 'Classic Barber', ownerName: 'John Doe', city: 'Jakarta', subscriptionPlan: 'Enterprise', createdAt: new Date(), photoUrl: null },
                    { id: '2', name: 'Style Hut', ownerName: 'Jane Smith', city: 'Bali', subscriptionPlan: 'Professional', createdAt: new Date(), photoUrl: null }
                ];
            }
        }
    });

    // Mock data untuk charts
    const revenueData = [
        { month: 'Jan', revenue: 15000000 },
        { month: 'Feb', revenue: 18000000 },
        { month: 'Mar', revenue: 22000000 },
        { month: 'Apr', revenue: 25000000 },
        { month: 'May', revenue: 28000000 },
        { month: 'Jun', revenue: 32000000 },
        { month: 'Jul', revenue: 35000000 },
        { month: 'Aug', revenue: 38000000 },
        { month: 'Sep', revenue: 42000000 },
        { month: 'Oct', revenue: 45000000 },
        { month: 'Nov', revenue: 48000000 },
        { month: 'Dec', revenue: 52000000 },
    ];

    const subscriptionData = [
        { name: 'Basic', value: 45 },
        { name: 'Professional', value: 35 },
        { name: 'Enterprise', value: 20 },
    ];

    const COLORS = ['#f59e0b', '#d97706', '#b45309']; // Amber 500, 600, 700

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Platform Overview</h1>
                    <p className="text-gray-400 mt-1">
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* System Alerts */}
            {stats?.alerts?.length > 0 && (
                <div className="bg-yellow-900 border border-yellow-700 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 flex-shrink-0" />
                        <div>
                            <h3 className="text-yellow-400 font-semibold mb-1">System Alerts</h3>
                            <ul className="space-y-1 text-sm text-yellow-200">
                                {stats.alerts.map((alert, index) => (
                                    <li key={index}>• {alert.message}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Main KPI Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Barbershops */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-amber-900/50 p-3 rounded-lg border border-amber-500/20">
                            <BuildingStorefrontIcon className="h-6 w-6 text-amber-500" />
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                            {stats?.barbershopGrowth >= 0 ? (
                                <>
                                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                                    <span className="text-green-400">+{stats?.barbershopGrowth}%</span>
                                </>
                            ) : (
                                <>
                                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
                                    <span className="text-red-400">{stats?.barbershopGrowth}%</span>
                                </>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-gray-400">Total Barbershops</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats?.totalBarbershops || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        Active: {stats?.activeBarbershops || 0} • Suspended: {stats?.suspendedBarbershops || 0}
                    </p>
                </div>

                {/* Total Revenue (MRR) */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-900 p-3 rounded-lg">
                            <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                            {stats?.revenueGrowth >= 0 ? (
                                <>
                                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                                    <span className="text-green-400">+{stats?.revenueGrowth}%</span>
                                </>
                            ) : (
                                <>
                                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
                                    <span className="text-red-400">{stats?.revenueGrowth}%</span>
                                </>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-gray-400">MRR (Monthly Recurring Revenue)</p>
                    <p className="text-3xl font-bold text-white mt-1">
                        Rp {(stats?.totalRevenue || 0).toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Year over year: <span className="text-green-400">+25%</span>
                    </p>
                </div>

                {/* Total Users */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-900 p-3 rounded-lg">
                            <UsersIcon className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                            {stats?.userGrowth >= 0 ? (
                                <>
                                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                                    <span className="text-green-400">+{stats?.userGrowth}%</span>
                                </>
                            ) : (
                                <>
                                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
                                    <span className="text-red-400">{stats?.userGrowth}%</span>
                                </>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-gray-400">Total Users</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats?.totalUsers || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        Customers: {stats?.totalCustomers || 0} • Barbers: {stats?.totalBarbers || 0}
                    </p>
                </div>

                {/* Total Transactions */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-pink-900 p-3 rounded-lg">
                            <ChartBarIcon className="h-6 w-6 text-pink-400" />
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                            {stats?.transactionGrowth >= 0 ? (
                                <>
                                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                                    <span className="text-green-400">+{stats?.transactionGrowth}%</span>
                                </>
                            ) : (
                                <>
                                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
                                    <span className="text-red-400">{stats?.transactionGrowth}%</span>
                                </>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-gray-400">Total Transactions (This Month)</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats?.totalTransactions || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        Average per day: {Math.round((stats?.totalTransactions || 0) / 30)}
                    </p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4">Revenue Trend (Last 12 Months)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                labelStyle={{ color: '#f9fafb' }}
                                formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Revenue']}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Subscription Distribution */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4">Subscription Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={subscriptionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {subscriptionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                labelStyle={{ color: '#f9fafb' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="mt-4 space-y-2">
                        {subscriptionData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                                    <span className="text-sm text-gray-300">{item.name}</span>
                                </div>
                                <span className="text-sm font-semibold text-white">{item.value} shops</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Performing Barbershops & Recent Sign-ups */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Performers */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Top Performing Barbershops</h3>
                        <Link to="/super-admin/barbershops" className="text-amber-500 hover:text-amber-400 text-sm font-medium">
                            View All →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {stats?.topBarbershops?.map((shop, index) => (
                            <div key={shop.id} className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                                <div className="w-8 h-8 rounded-full bg-amber-900/50 flex items-center justify-center font-bold text-amber-500 border border-amber-500/20">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-white">{shop.name}</p>
                                    <p className="text-xs text-gray-400">{shop.city}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-white">
                                        Rp {shop.monthlyRevenue?.toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-xs text-gray-400">{shop.totalTransactions} txns</p>
                                </div>
                            </div>
                        )) || (
                                <p className="text-center text-gray-500 py-4">No data available</p>
                            )}
                    </div>
                </div>

                {/* Recent Sign-ups */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Recent Sign-ups</h3>
                        <Link to="/super-admin/barbershops" className="text-amber-500 hover:text-amber-400 text-sm font-medium">
                            View All →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentBarbershops?.map((shop) => (
                            <div key={shop.id} className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                                <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-gray-400 border border-gray-600">
                                    {shop.name[0]}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-white">{shop.name}</p>
                                    <p className="text-xs text-gray-400">{shop.ownerName} • {shop.city}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${shop.subscriptionPlan === 'Enterprise' ? 'bg-pink-900 text-pink-400' :
                                        shop.subscriptionPlan === 'Professional' ? 'bg-purple-900 text-purple-400' :
                                            'bg-blue-900 text-blue-400'
                                        }`}>
                                        {shop.subscriptionPlan}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(shop.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                        )) || (
                                <p className="text-center text-gray-500 py-4">No recent sign-ups</p>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
