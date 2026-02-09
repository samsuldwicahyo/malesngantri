import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import CustomerNavbar from '../../components/customer/CustomerNavbar';
import CustomerSidebar from '../../components/customer/CustomerSidebar';
import CustomerBottomNav from '../../components/customer/CustomerBottomNav';

// Pages
import Home from './Home';
import BarbershopDetail from './BarbershopDetail';
import MyQueue from './MyQueue';
import History from './History';
import Favorites from './Favorites';
import Profile from './Profile';

const CustomerDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Navbar - Fixed top */}
            <CustomerNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex">
                {/* Sidebar - Desktop only */}
                <CustomerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 pt-20">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/barbershop/:id" element={<BarbershopDetail />} />
                        <Route path="/my-queue" element={<MyQueue />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/favorites" element={<Favorites />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="*" element={<Navigate to="/customer" replace />} />
                    </Routes>
                </main>
            </div>

            {/* Bottom Navigation - Mobile only */}
            <CustomerBottomNav />
        </div>
    );
};

export default CustomerDashboard;
