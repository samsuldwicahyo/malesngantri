import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Bars3Icon,
    BellIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';

const CustomerNavbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin keluar?')) {
            logout();
            navigate('/login');
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo & Menu */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onMenuClick}
                            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">💈</span>
                            <span className="text-xl font-bold text-amber-500">MalasNgantri</span>
                        </div>
                    </div>

                    {/* Center: Search (Desktop only) */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Cari barbershop..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Right: Notifications & Profile */}
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-400 hover:text-white transition">
                            <BellIcon className="h-6 w-6" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
                        </button>

                        {/* Profile Dropdown */}
                        <Menu as="div" className="relative">
                            <Menu.Button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 transition">
                                <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-amber-900/20">
                                    {user?.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden md:block font-medium text-white">{user?.fullName}</span>
                            </Menu.Button>

                            <Menu.Items className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => navigate('/customer/profile')}
                                            className={`${active ? 'bg-gray-700 text-white' : 'text-gray-300'} w-full text-left px-4 py-2 text-sm transition`}
                                        >
                                            Profil Saya
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => navigate('/customer/history')}
                                            className={`${active ? 'bg-gray-700 text-white' : 'text-gray-300'} w-full text-left px-4 py-2 text-sm transition`}
                                        >
                                            Riwayat
                                        </button>
                                    )}
                                </Menu.Item>
                                <div className="border-t border-gray-700 my-1"></div>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={handleLogout}
                                            className={`${active ? 'bg-gray-700' : ''} w-full text-left px-4 py-2 text-sm text-red-500 transition`}
                                        >
                                            Keluar
                                        </button>
                                    )}
                                </Menu.Item>
                            </Menu.Items>
                        </Menu>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default CustomerNavbar;
