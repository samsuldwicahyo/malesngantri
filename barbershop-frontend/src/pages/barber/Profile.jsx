import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import {
    UserCircleIcon,
    PhoneIcon,
    EnvelopeIcon,
    CameraIcon,
    PlusIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        specialization: '',
        bio: ''
    });
    const queryClient = useQueryClient();

    // Fetch barber profile
    const { data: barberProfile, isLoading } = useQuery({
        queryKey: ['barberProfile'],
        queryFn: async () => {
            const { data } = await apiClient.get('/barbers/me');
            return data.data;
        },
        onSuccess: (data) => {
            setFormData({
                name: data.name || '',
                phoneNumber: data.phoneNumber || '',
                specialization: data.specialization || '',
                bio: data.bio || ''
            });
        }
    });

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
            const { data: response } = await apiClient.put('/barbers/me', data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Profil berhasil diperbarui');
            queryClient.invalidateQueries(['barberProfile']);
            setIsEditing(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error?.message || 'Gagal memperbarui profil');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProfileMutation.mutate(formData);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: barberProfile?.name || '',
            phoneNumber: barberProfile?.phoneNumber || '',
            specialization: barberProfile?.specialization || '',
            bio: barberProfile?.bio || ''
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start gap-6">
                    {/* Profile Picture */}
                    <div className="relative">
                        <img
                            src={barberProfile?.photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(barberProfile?.name || 'Barber')}
                            alt={barberProfile?.name}
                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                        />
                        <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition">
                            <CameraIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{barberProfile?.name}</h2>
                        <p className="text-gray-600 mb-3">{barberProfile?.specialization || 'Barber Professional'}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-1">
                                <EnvelopeIcon className="h-4 w-4" />
                                {user?.email}
                            </span>
                            {barberProfile?.phoneNumber && (
                                <span className="flex items-center gap-1">
                                    <PhoneIcon className="h-4 w-4" />
                                    {barberProfile.phoneNumber}
                                </span>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{barberProfile?.rating?.toFixed(1) || '0.0'}</p>
                                <p className="text-sm text-gray-500">Rating</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{barberProfile?.totalCustomers || 0}</p>
                                <p className="text-sm text-gray-500">Total Customers</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{barberProfile?.yearsOfExperience || 0}</p>
                                <p className="text-sm text-gray-500">Tahun Pengalaman</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Form */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Informasi Profil</h3>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Edit Profil
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
                        <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spesialisasi</label>
                        <input
                            type="text"
                            value={formData.specialization}
                            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                            disabled={!isEditing}
                            placeholder="e.g., Fade Specialist, Classic Cuts"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            disabled={!isEditing}
                            rows={4}
                            placeholder="Ceritakan tentang diri Anda dan keahlian Anda..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                    </div>

                    {isEditing && (
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={updateProfileMutation.isPending}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Portfolio Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Portfolio</h3>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                        <PlusIcon className="h-5 w-5" />
                        Tambah Foto
                    </button>
                </div>

                {barberProfile?.portfolioPhotos && barberProfile.portfolioPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {barberProfile.portfolioPhotos.map((photo, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={photo}
                                    alt={`Portfolio ${index + 1}`}
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                                <button className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📸</div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Belum Ada Portfolio</h4>
                        <p className="text-gray-500 mb-4">
                            Tambahkan foto hasil karya Anda untuk menarik lebih banyak customer
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
