import { useQuery } from '@tanstack/react-query';
import {
    ChartBarIcon,
    ClockIcon,
    StarIcon,
    UserGroupIcon,
    ArrowTrendingUpIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../api/axios';

const Stats = () => {
    // Fetch barber statistics
    const { data: stats, isLoading } = useQuery({
        queryKey: ['barberStats'],
        queryFn: async () => {
            const { data } = await apiClient.get('/barbers/me/stats');
            return data.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Statistics</h2>
                <p className="text-gray-600">Track your performance and customer satisfaction</p>
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <UserGroupIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Customers</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.totalCustomers || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-100 p-3 rounded-lg">
                            <StarIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Average Rating</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.averageRating?.toFixed(1) || '0.0'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <ClockIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Avg. Service Time</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.avgServiceTime || 0} min</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">This Month</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.customersThisMonth || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Placeholder */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Trends</h3>

                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📊</div>
                    <h4 className="text-xl font-semibold text-gray-700 mb-2">Charts Coming Soon</h4>
                    <p className="text-gray-500">
                        Visualisasi performa Anda akan ditampilkan di sini
                    </p>
                </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Reviews</h3>

                {stats?.recentReviews && stats.recentReviews.length > 0 ? (
                    <div className="space-y-4">
                        {stats.recentReviews.map((review, index) => (
                            <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-semibold text-gray-900">{review.customerName}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon
                                                    key={i}
                                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                                {review.comment && (
                                    <p className="text-gray-600 text-sm">{review.comment}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Belum ada review</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Stats;
