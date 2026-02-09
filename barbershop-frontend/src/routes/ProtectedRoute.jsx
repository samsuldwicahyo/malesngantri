import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        const redirectMap = {
            CUSTOMER: '/customer',
            BARBER: '/barber',
            ADMIN: '/admin',
            SUPER_ADMIN: '/super-admin'
        };
        if (user.role === 'CUSTOMER') {
            const publicUrl = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:3001';
            window.location.href = publicUrl;
            return null;
        }
        return <Navigate to={redirectMap[user.role] || '/'} replace />;
    }

    return children;
};

export default ProtectedRoute;
