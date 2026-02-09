import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    MagnifyingGlassIcon,
    MapPinIcon,
    FunnelIcon,
    ViewColumnsIcon,
    ListBulletIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [filters, setFilters] = useState({
        rating: 0,
        maxDistance: 50,
        priceRange: 'all',
        status: 'all'
    });

    const navigate = useNavigate();

    // Get user's geolocation
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    toast.error('Tidak dapat mengakses lokasi Anda');
                }
            );
        }
    }, []);

    // Fetch barbershops
    const { data: barbershops, isLoading } = useQuery({
        queryKey: ['barbershops', searchQuery, location, filters],
        queryFn: async () => {
            const params = {
                search: searchQuery,
                latitude: location?.latitude,
                longitude: location?.longitude,
                minRating: filters.rating,
                maxDistance: filters.maxDistance,
                status: filters.status !== 'all' ? filters.status : undefined
            };

            const { data } = await apiClient.get('/barbershops', { params });
            return data.data;
        },
        enabled: !!location
    });

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-black text-white tracking-tight">
                    Cari <span className="text-gradient-amber">Barbershop</span>
                </h1>
                <p className="text-gray-400 font-medium mt-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                    Temukan barbershop terbaik di sekitar Anda
                </p>
            </div>

            {/* Search & Filters */}
            <div className="glass-card p-6 mb-10 rounded-3xl border border-gray-700/50 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Search Bar */}
                    <div className="flex-1 relative group/input">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within/input:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama barbershop atau lokasi..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 shadow-inner rounded-2xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all outline-none placeholder:text-gray-600"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-4 rounded-xl border transition-all duration-300 flex items-center gap-2 font-black text-xs uppercase tracking-widest ${viewMode === 'grid' ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-900/40' : 'bg-gray-800 text-gray-500 border-gray-700 hover:text-white hover:border-gray-600'}`}
                        >
                            <ViewColumnsIcon className="h-4 w-4" />
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 rounded-xl border transition-all duration-300 flex items-center gap-2 font-black text-xs uppercase tracking-widest ${viewMode === 'list' ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-900/40' : 'bg-gray-800 text-gray-500 border-gray-700 hover:text-white hover:border-gray-600'}`}
                        >
                            <ListBulletIcon className="h-4 w-4" />
                            List
                        </button>
                        <button className="p-4 rounded-xl bg-gray-800 text-gray-500 border border-gray-700 hover:text-white hover:border-gray-600 transition-all">
                            <FunnelIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Active Filters */}
                {(filters.rating > 0 || filters.status !== 'all') && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {filters.rating > 0 && (
                            <span className="px-3 py-1 bg-amber-900/40 text-amber-500 rounded-full text-sm flex items-center gap-1 border border-amber-500/30">
                                Rating ≥ {filters.rating} ⭐
                                <button onClick={() => setFilters({ ...filters, rating: 0 })} className="ml-1 hover:text-amber-400">×</button>
                            </span>
                        )}
                        {filters.status !== 'all' && (
                            <span className="px-3 py-1 bg-green-900/40 text-green-500 rounded-full text-sm flex items-center gap-1 border border-green-500/30">
                                {filters.status === 'open' ? 'Buka' : 'Tutup'}
                                <button onClick={() => setFilters({ ...filters, status: 'all' })} className="ml-1 hover:text-green-400">×</button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass-card rounded-3xl p-4 animate-pulse border border-gray-700/50 h-[400px]">
                            <div className="bg-gray-800/50 h-56 rounded-2xl mb-6"></div>
                            <div className="bg-gray-800/50 h-8 rounded-full mb-4 w-3/4"></div>
                            <div className="bg-gray-800/50 h-4 rounded-full w-1/2"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Barbershops Grid/List */}
            {!isLoading && barbershops && (
                <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                    : 'space-y-6'
                }>
                    {barbershops.map((barbershop) => {
                        const distance = location
                            ? calculateDistance(
                                location.latitude,
                                location.longitude,
                                barbershop.latitude,
                                barbershop.longitude
                            )
                            : null;

                        return (
                            <div
                                key={barbershop.id}
                                onClick={() => navigate(`/customer/barbershop/${barbershop.id}`)}
                                className={`glass-card group hover:scale-[1.03] transition-all duration-500 rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50 cursor-pointer flex flex-col ${viewMode === 'list' ? 'md:flex-row' : ''
                                    }`}
                            >
                                {/* Image */}
                                <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'h-56' : 'w-full md:w-72 h-48 md:h-auto'}`}>
                                    <img
                                        src={barbershop.photoUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000'}
                                        alt={barbershop.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent opacity-80"></div>
                                    <div className="absolute top-4 left-4">
                                        {barbershop.isOpen ? (
                                            <span className="px-3 py-1 bg-green-500/20 text-green-500 text-[10px] font-black tracking-widest uppercase rounded-lg border border-green-500/30 backdrop-blur-md">Open Now</span>
                                        ) : (
                                            <span className="px-3 py-1 bg-red-500/20 text-red-500 text-[10px] font-black tracking-widest uppercase rounded-lg border border-red-500/30 backdrop-blur-md">Closed</span>
                                        )}
                                    </div>
                                    {distance && (
                                        <div className="absolute bottom-4 right-4 bg-amber-500 text-white px-2 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-lg shadow-amber-900/40">
                                            {distance} KM
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="text-2xl font-black text-white group-hover:text-amber-500 transition-colors tracking-tight">{barbershop.name}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex items-center text-amber-500">
                                                <StarIconSolid className="h-4 w-4" />
                                                <span className="text-sm font-black ml-1">{barbershop.averageRating?.toFixed(1) || '0.0'}</span>
                                            </div>
                                            <span className="text-gray-500 text-xs font-bold">({barbershop.totalReviews || 0} Reviews)</span>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-start gap-2 text-gray-400 text-xs font-bold mb-6">
                                        <MapPinIcon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                        <span className="line-clamp-1">{barbershop.address}</span>
                                    </div>

                                    {/* Queue Info */}
                                    <div className="mt-auto pt-6 border-t border-gray-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                                {barbershop.activeQueues || 0} Waiting
                                            </span>
                                        </div>
                                        <span className="text-xs font-black text-amber-500 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                            Book Now →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && (!barbershops || barbershops.length === 0) && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">💈</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak ada barbershop ditemukan</h3>
                    <p className="text-gray-500">Coba ubah kata kunci pencarian atau filter Anda</p>
                </div>
            )}
        </div>
    );
};

export default Home;
