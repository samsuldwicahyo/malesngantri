import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { UserCircleIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, fetchUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || '',
        email: user?.email || ''
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
            const { data: response } = await apiClient.put('/users/profile', data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Profil berhasil diperbarui');
            fetchUser();
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

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
                <p className="text-gray-600 mt-1">Kelola informasi profil Anda</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="h-20 w-20 text-gray-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{user?.fullName}</h2>
                        <p className="text-gray-600">{user?.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {user?.role}
                        </span>
                    </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nomor Telepon
                            </label>
                            <div className="relative">
                                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                Edit Profil
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            fullName: user?.fullName || '',
                                            phoneNumber: user?.phoneNumber || '',
                                            email: user?.email || ''
                                        });
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateProfileMutation.isPending}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
