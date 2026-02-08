import { NavLink } from 'react-router-dom';
import {
    HomeIcon,
    ClockIcon,
    DocumentTextIcon,
    HeartIcon,
    UserCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const CustomerSidebar = ({ isOpen, onClose }) => {
    const navItems = [
        { path: '/customer', icon: HomeIcon, label: 'Beranda', exact: true },
        { path: '/customer/my-queue', icon: ClockIcon, label: 'Antrian Saya' },
        { path: '/customer/history', icon: DocumentTextIcon, label: 'Riwayat' },
        { path: '/customer/favorites', icon: HeartIcon, label: 'Favorit' },
        { path: '/customer/profile', icon: UserCircleIcon, label: 'Profil' },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between p-4 border-b md:hidden">
                    <span className="text-xl font-bold text-gray-900">Menu</span>
                    <button onClick={onClose} className="p-2 text-gray-600 hover:text-gray-900">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-2 mt-16 md:mt-0">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`
                            }
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default CustomerSidebar;
