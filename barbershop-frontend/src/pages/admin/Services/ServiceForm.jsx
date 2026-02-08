import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import apiClient from '../../../api/axios';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ServiceForm = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        duration: 30,
        category: 'HAIRCUT'
    });

    // Fetch service data if editing
    const { data: service } = useQuery({
        queryKey: ['service', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/services/${id}`);
            return data.data;
        },
        enabled: isEdit,
        onSuccess: (data) => {
            setFormData({
                name: data.name,
                description: data.description || '',
                price: data.price,
                duration: data.duration,
                category: data.category || 'HAIRCUT'
            });
        }
    });

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (isEdit) {
                const response = await apiClient.put(`/services/${id}`, data);
                return response.data.data;
            } else {
                const payload = { ...data, barbershopId: user.barbershop.id };
                const response = await apiClient.post('/services', payload);
                return response.data.data;
            }
        },
        onSuccess: () => {
            toast.success(isEdit ? 'Layanan berhasil diperbarui' : 'Layanan berhasil ditambahkan');
            queryClient.invalidateQueries(['services']);
            navigate('/admin/services');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error?.message || 'Gagal menyimpan layanan');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.duration) {
            toast.error('Mohon lengkapi semua field yang wajib diisi');
            return;
        }

        saveMutation.mutate(formData);
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/services')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    Kembali ke Service List
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEdit ? 'Edit Layanan' : 'Tambah Layanan Baru'}
                </h1>
                <p className="text-gray-600 mt-1">
                    {isEdit ? 'Perbarui informasi layanan' : 'Tambahkan layanan baru ke barbershop Anda'}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Layanan <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Haircut Premium"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Deskripsi singkat tentang layanan..."
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Harga (Rp) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="1000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Durasi (menit) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            min="5"
                            step="5"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori
                    </label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="HAIRCUT">Haircut</option>
                        <option value="SHAVING">Shaving</option>
                        <option value="COLORING">Coloring</option>
                        <option value="TREATMENT">Treatment</option>
                        <option value="STYLING">Styling</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/services')}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={saveMutation.isPending}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {saveMutation.isPending ? 'Menyimpan...' : isEdit ? 'Perbarui Layanan' : 'Tambah Layanan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ServiceForm;
