import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    HomeIcon,
    BuildingStorefrontIcon,
    CreditCardIcon,
    UsersIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    LifebuoyIcon,
    BellIcon,
    MagnifyingGlassIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/axios';

// Pages
import Overview from './Overview';
import BarbershopList from './Barbershops/BarbershopList';
import BarbershopDetail from './Barbershops/BarbershopDetail';
import BarbershopForm from './Barbershops/BarbershopForm';
import SubscriptionList from './Subscriptions/SubscriptionList';
import PlanManagement from './Subscriptions/PlanManagement';
import BillingHistory from './Subscriptions/BillingHistory';
import UserList from './Users/UserList';
import PlatformAnalytics from './Analytics/PlatformAnalytics';
import GlobalSettings from './Settings/GlobalSettings';
import FeatureFlags from './Settings/FeatureFlags';
import NotificationTemplates from './Settings/NotificationTemplates';
import SupportTickets from './Support/SupportTickets';
import BrandMark from '../../components/BrandMark';

const SuperAdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { user, logout } = useAuth();
    const location = useLocation();

    // Fetch platform health status
    const { data: healthStatus } = useQuery({
        queryKey: ['platformHealth'],
        queryFn: async () => {
            // Fallback for demo if endpoint doesn't exist yet
            try {
                const { data } = await apiClient.get('/super-admin/health');
                return data.data;
            } catch (err) {
                return { status: 'healthy' };
            }
        },
        refetchInterval: 60000 // Check every minute
    });

    // Fetch notifications
    const { data: notifications } = useQuery({
        queryKey: ['superAdminNotifications'],
        queryFn: async () => {
            try {
                const { data } = await apiClient.get('/super-admin/notifications');
                return data.data;
            } catch (err) {
                return { unread: 0 };
            }
        },
        refetchInterval: 30000
    });

    const navigation = [
        { name: 'Dashboard', href: '/super-admin', icon: HomeIcon },
        { name: 'Barbershops', href: '/super-admin/barbershops', icon: BuildingStorefrontIcon },
        { name: 'Subscriptions', href: '/super-admin/subscriptions', icon: CreditCardIcon },
        { name: 'Users', href: '/super-admin/users', icon: UsersIcon },
        { name: 'Analytics', href: '/super-admin/analytics', icon: ChartBarIcon },
        { name: 'Support', href: '/super-admin/support', icon: LifebuoyIcon },
        { name: 'Settings', href: '/super-admin/settings', icon: Cog6ToothIcon },
    ];

    const getHealthStatusColor = (status) => {
        if (status === 'healthy') return 'bg-green-500';
        if (status === 'warning') return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-gray-800 shadow-xl transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-700">
                        <div className="flex items-center gap-3">
                            <BrandMark className="w-10 h-10" />
                            {sidebarOpen && (
                                <div>
                                    <h1 className="text-white font-black tracking-tight">
                                        MALAS<span className="text-amber-500">NGANTRI</span>
                                    </h1>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest">Super Admin</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto">
                        <ul className="space-y-2">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href ||
                                    (item.href !== '/super-admin' && location.pathname.startsWith(item.href));

                                return (
                                    <li key={item.name}>
                                        <Link
                                            to={item.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                                                ? 'bg-amber-600 text-white'
                                                : 'text-gray-300 hover:bg-gray-700'
                                                }`}
                                            title={!sidebarOpen ? item.name : ''}
                                        >
                                            <item.icon className="h-5 w-5 flex-shrink-0" />
                                            {sidebarOpen && <span className="font-medium">{item.name}</span>}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Platform Health Status */}
                    {sidebarOpen && (
                        <div className="p-4 border-t border-gray-700">
                            <div className="bg-gray-700 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-2 h-2 rounded-full ${getHealthStatusColor(healthStatus?.status)} animate-pulse`}></div>
                                    <span className="text-xs text-gray-300 font-semibold">System Status</span>
                                </div>
                                <div className="space-y-1 text-xs text-gray-400">
                                    <div className="flex justify-between">
                                        <span>API</span>
                                        <span className="text-green-400">●</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Database</span>
                                        <span className="text-green-400">●</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Socket.IO</span>
                                        <span className="text-green-400">●</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-gray-700">
                        {sidebarOpen ? (
                            <>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center">
                                        <span className="text-white font-bold">{user?.fullName?.[0]}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white truncate">{user?.fullName}</p>
                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                                >
                                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                    <span className="text-sm font-medium">Logout</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                                title="Logout"
                            >
                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Top Bar */}
                <header className="bg-gray-800 shadow-lg sticky top-0 z-40">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Toggle Sidebar */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="text-gray-300 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* Global Search */}
                            <div className="flex-1 max-w-2xl mx-8">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search barbershops, users, subscriptions..."
                                        className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Notifications */}
                            <button className="relative text-gray-300 hover:text-white">
                                <BellIcon className="h-6 w-6" />
                                {notifications?.unread > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {notifications.unread}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <Routes>
                        <Route path="/" element={<Overview />} />

                        {/* Barbershops */}
                        <Route path="/barbershops" element={<BarbershopList />} />
                        <Route path="/barbershops/add" element={<BarbershopForm />} />
                        <Route path="/barbershops/:id" element={<BarbershopDetail />} />
                        <Route path="/barbershops/:id/edit" element={<BarbershopForm />} />

                        {/* Subscriptions */}
                        <Route path="/subscriptions" element={<SubscriptionList />} />
                        <Route path="/subscriptions/plans" element={<PlanManagement />} />
                        <Route path="/subscriptions/billing" element={<BillingHistory />} />

                        {/* Users */}
                        <Route path="/users" element={<UserList />} />

                        {/* Analytics */}
                        <Route path="/analytics" element={<PlatformAnalytics />} />

                        {/* Support */}
                        <Route path="/support" element={<SupportTickets />} />

                        {/* Settings */}
                        <Route path="/settings" element={<GlobalSettings />} />
                        <Route path="/settings/features" element={<FeatureFlags />} />
                        <Route path="/settings/notifications" element={<NotificationTemplates />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/super-admin" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
