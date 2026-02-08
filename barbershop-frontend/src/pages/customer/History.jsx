import { useQuery } from '@tanstack/react-query';
import { ClockIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import apiClient from '../../api/axios';

const History = () => {
    const { data: history, isLoading } = useQuery({
        queryKey: ['queueHistory'],
        queryFn: async () => {
            const { data } = await apiClient.get('/queues/history');
            return data.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Riwayat Kunjungan</h1>
                <p className="text-gray-600 mt-1">Lihat semua kunjungan Anda ke barbershop</p>
            </div>

            {history && history.length > 0 ? (
                <div className="space-y-4">
                    {history.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900">{item.barbershop?.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                        <MapPinIcon className="h-4 w-4" />
                                        <span>{item.barbershop?.address}</span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {item.status === 'COMPLETED' ? 'Selesai' : 'Dibatalkan'}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">Barber</p>
                                    <p className="font-medium">{item.barber?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Layanan</p>
                                    <p className="font-medium">{item.service?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tanggal</p>
                                    <p className="font-medium">{new Date(item.scheduledDate).toLocaleDateString('id-ID')}</p>
                                </div>
                            </div>

                            {item.status === 'COMPLETED' && !item.rating && (
                                <button className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-100 transition">
                                    Berikan Rating & Review
                                </button>
                            )}

                            {item.rating && (
                                <div className="flex items-center gap-2 pt-4 border-t">
                                    <span className="text-sm text-gray-500">Rating Anda:</span>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <StarIconSolid
                                                key={star}
                                                className={`h-5 w-5 ${star <= item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📜</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Riwayat</h2>
                    <p className="text-gray-600">Riwayat kunjungan Anda akan muncul di sini</p>
                </div>
            )}
        </div>
    );
};

export default History;
