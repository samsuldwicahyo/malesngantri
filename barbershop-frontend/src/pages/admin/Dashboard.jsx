import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
    HomeIcon,
    UserGroupIcon,
    WrenchScrewdriverIcon,
    ClipboardDocumentListIcon,
    UsersIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

// Pages
import Overview from './Overview';
import BarberList from './Barbers/BarberList';
import AddBarber from './Barbers/AddBarber';
import EditBarber from './Barbers/EditBarber';
import BarberDetail from './Barbers/BarberDetail';
import ServiceList from './Services/ServiceList';
import ServiceForm from './Services/ServiceForm';
import QueueMonitor from './Queues/QueueMonitor';
import CustomerList from './Customers/CustomerList';
import Reports from './Analytics/Reports';
import BarbershopSettings from './Settings/Barbershop';
import SubscriptionInfo from './Settings/Subscription';
import BrandMark from '../../components/BrandMark';

const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Barbers', href: '/admin/barbers', icon: UserGroupIcon },
        { name: 'Layanan', href: '/admin/services', icon: WrenchScrewdriverIcon },
        { name: 'Monitor Antrian', href: '/admin/queues', icon: ClipboardDocumentListIcon },
        { name: 'Customers', href: '/admin/customers', icon: UsersIcon },
        { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
        { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
    ];

    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin keluar?')) {
            logout();
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-mesh text-gray-100 flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full glass-card w-64 z-50 transform transition-all duration-300 lg:translate-x-0 border-r border-gray-700/50 backdrop-blur-xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <BrandMark className="w-10 h-10" />
                                <div>
                                    <h1 className="text-lg font-black text-white tracking-tight">
                                        MALAS<span className="text-amber-500">NGANTRI</span>
                                    </h1>
                                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Admin Dashboard</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto">
                        <ul className="space-y-2">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href ||
                                    (item.href !== '/admin' && location.pathname.startsWith(item.href));

                                return (
                                    <li key={item.name}>
                                        <Link
                                            to={item.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                                                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20'
                                                : 'text-gray-300 hover:bg-gray-700'
                                                }`}
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            <span className="font-medium">{item.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-gray-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-amber-900/50 flex items-center justify-center border border-amber-500/30">
                                <span className="text-amber-500 font-bold text-lg">
                                    {user?.fullName?.[0]?.toUpperCase() || 'A'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">{user?.fullName}</p>
                                <p className="text-sm text-gray-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 border border-red-500/20 transition-all active:scale-95"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            <span className="font-bold">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-64 relative">
                {/* Top Bar */}
                <header className="glass-navbar border-b border-gray-700/50 h-16 shrink-0 flex items-center px-4">
                    <div className="flex-1 flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-400 hover:text-white transition rounded-lg hover:bg-gray-800"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>

                        <div className="flex items-center gap-4 bg-gray-800/40 px-4 py-1.5 rounded-full border border-gray-700/50 backdrop-blur-sm">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Barbershop</span>
                            <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                            <span className="font-black text-amber-500 text-sm">
                                {user?.barbershop?.name || 'Loading...'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <Routes>
                        <Route path="/" element={<Overview />} />

                        {/* Barbers */}
                        <Route path="/barbers" element={<BarberList />} />
                        <Route path="/barbers/add" element={<AddBarber />} />
                        <Route path="/barbers/:id/edit" element={<EditBarber />} />
                        <Route path="/barbers/:id" element={<BarberDetail />} />

                        {/* Services */}
                        <Route path="/services" element={<ServiceList />} />
                        <Route path="/services/add" element={<ServiceForm />} />
                        <Route path="/services/:id/edit" element={<ServiceForm />} />

                        {/* Queues */}
                        <Route path="/queues" element={<QueueMonitor />} />

                        {/* Customers */}
                        <Route path="/customers" element={<CustomerList />} />

                        {/* Analytics */}
                        <Route path="/analytics" element={<Reports />} />

                        {/* Settings */}
                        <Route path="/settings" element={<BarbershopSettings />} />
                        <Route path="/settings/subscription" element={<SubscriptionInfo />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
