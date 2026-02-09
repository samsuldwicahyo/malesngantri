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
                <h1 className="text-3xl font-black text-white tracking-tight">Profil Saya</h1>
                <p className="text-gray-500 mt-1 font-medium">Kelola informasi profil Anda</p>
            </div>

            <div className="glass-card rounded-3xl border border-gray-700/50 shadow-2xl p-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-700/50">
                    <div className="w-24 h-24 bg-gray-900/60 rounded-full flex items-center justify-center border border-gray-800">
                        <UserCircleIcon className="h-20 w-20 text-gray-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white">{user?.fullName}</h2>
                        <p className="text-gray-500">{user?.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-amber-500/15 text-amber-400 rounded-full text-xs font-black tracking-widest border border-amber-500/30">
                            {user?.role}
                        </span>
                    </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700/60 rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all outline-none disabled:opacity-70 disabled:bg-gray-900/30"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">
                                Nomor Telepon
                            </label>
                            <div className="relative">
                                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700/60 rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all outline-none disabled:opacity-70 disabled:bg-gray-900/30"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">
                                Email
                            </label>
                            <div className="relative">
                                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700/60 rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all outline-none disabled:opacity-70 disabled:bg-gray-900/30"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="flex-1 btn-premium py-3 text-sm tracking-widest"
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
                                    className="flex-1 bg-gray-800/60 text-gray-300 py-3 rounded-xl font-black hover:bg-gray-700/60 transition border border-gray-700/60"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateProfileMutation.isPending}
                                    className="flex-1 btn-premium py-3 text-sm tracking-widest disabled:opacity-50"
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
