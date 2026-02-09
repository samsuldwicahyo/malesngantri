import { NavLink } from 'react-router-dom';
import {
    HomeIcon,
    ClockIcon,
    DocumentTextIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    ClockIcon as ClockIconSolid,
    DocumentTextIcon as DocumentTextIconSolid,
    UserCircleIcon as UserCircleIconSolid
} from '@heroicons/react/24/solid';

const CustomerBottomNav = () => {
    const navItems = [
        {
            path: '/customer',
            icon: HomeIcon,
            iconSolid: HomeIconSolid,
            label: 'Home',
            exact: true
        },
        {
            path: '/customer/my-queue',
            icon: ClockIcon,
            iconSolid: ClockIconSolid,
            label: 'Antrian'
        },
        {
            path: '/customer/history',
            icon: DocumentTextIcon,
            iconSolid: DocumentTextIconSolid,
            label: 'Riwayat'
        },
        {
            path: '/customer/profile',
            icon: UserCircleIcon,
            iconSolid: UserCircleIconSolid,
            label: 'Profil'
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 md:hidden z-50">
            <div className="flex items-center justify-around">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 py-3 px-4 flex-1 transition ${isActive ? 'text-amber-500' : 'text-gray-400 hover:text-gray-200'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive ? (
                                    <item.iconSolid className="h-6 w-6" />
                                ) : (
                                    <item.icon className="h-6 w-6" />
                                )}
                                <span className="text-xs font-medium">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default CustomerBottomNav;
