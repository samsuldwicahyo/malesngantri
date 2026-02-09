import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './contexts/SocketContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
// import RegisterPage from './pages/auth/RegisterPage'; // Placeholder
const RegisterPage = () => <div className="p-10 text-center text-white"><h1 className="text-2xl pt-20">Fitur Registrasi Segera Hadir</h1></div>;

import CustomerDashboard from './pages/customer/Dashboard';
import BarberDashboard from './pages/barber/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import SuperAdminDashboard from './pages/super-admin/Dashboard';

import ProtectedRoute from './routes/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <SocketProvider>
                    <BrowserRouter>
                        <div className="min-h-screen bg-gray-900 text-gray-100">
                            <Toaster position="top-center" />
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />

                                {/* Protected Routes - Customer */}
                                <Route
                                    path="/customer/*"
                                    element={
                                        <ProtectedRoute allowedRoles={['CUSTOMER']}>
                                            <CustomerDashboard />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Protected Routes - Barber */}
                                <Route
                                    path="/barber/*"
                                    element={
                                        <ProtectedRoute allowedRoles={['BARBER']}>
                                            <BarberDashboard />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Protected Routes - Admin */}
                                <Route
                                    path="/admin/*"
                                    element={
                                        <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                                            <AdminDashboard />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Protected Routes - Super Admin */}
                                <Route
                                    path="/super-admin/*"
                                    element={
                                        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                                            <SuperAdminDashboard />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Fallback */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </div>
                    </BrowserRouter>
                </SocketProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
