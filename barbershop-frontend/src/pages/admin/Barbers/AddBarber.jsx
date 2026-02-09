import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../../api/axios';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AddBarber = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Personal Info
        name: '',
        email: '',
        phoneNumber: '',
        photoUrl: '',

        // Step 2: Professional Info
        specialization: '',
        yearsOfExperience: 0,
        bio: '',
        serviceIds: [],

        // Step 3: Commission & Schedule
        commissionRate: 30,
        workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
        startTime: '09:00',
        endTime: '18:00',
    });

    // Fetch available services
    const { data: services } = useQuery({
        queryKey: ['services', user?.barbershop?.id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/barbershops/${user.barbershop.id}/services`);
            return data.data;
        },
        enabled: !!user?.barbershop?.id
    });

    // Create barber mutation
    const createBarberMutation = useMutation({
        mutationFn: async (data) => {
            const payload = {
                ...data,
                barbershopId: user.barbershop.id
            };
            const response = await apiClient.post('/barbers', payload);
            return response.data.data;
        },
        onSuccess: () => {
            toast.success('Barber berhasil ditambahkan!');
            queryClient.invalidateQueries(['barbers']);
            navigate('/admin/barbers');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error?.message || 'Gagal menambahkan barber');
        }
    });

    const handleNext = () => {
        // Validation for each step
        if (currentStep === 1) {
            if (!formData.name || !formData.email || !formData.phoneNumber) {
                toast.error('Mohon lengkapi semua field yang wajib diisi');
                return;
            }
        }

        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = () => {
        createBarberMutation.mutate(formData);
    };

    const toggleService = (serviceId) => {
        setFormData(prev => ({
            ...prev,
            serviceIds: prev.serviceIds.includes(serviceId)
                ? prev.serviceIds.filter(id => id !== serviceId)
                : [...prev.serviceIds, serviceId]
        }));
    };

    const toggleWorkingDay = (day) => {
        setFormData(prev => ({
            ...prev,
            workingDays: prev.workingDays.includes(day)
                ? prev.workingDays.filter(d => d !== day)
                : [...prev.workingDays, day]
        }));
    };

    const steps = [
        { number: 1, title: 'Personal Info' },
        { number: 2, title: 'Professional Info' },
        { number: 3, title: 'Commission & Schedule' },
        { number: 4, title: 'Review & Submit' }
    ];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/barbers')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    Kembali ke Barber List
                </button>
                <h1 className="text-3xl font-black text-white">Tambah Barber Baru</h1>
                <p className="text-gray-500 mt-1">Lengkapi informasi barber untuk menambahkan ke tim Anda</p>
            </div>

            {/* Progress Steps */}
            <div className="glass-card rounded-2xl border border-gray-700/50 p-6 mb-6">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${currentStep >= step.number
                                        ? 'bg-amber-500 text-gray-900'
                                        : 'bg-gray-800 text-gray-400'
                                    }`}>
                                    {currentStep > step.number ? (
                                        <CheckCircleIcon className="h-6 w-6" />
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                <p className={`text-xs mt-2 font-bold uppercase tracking-widest ${currentStep >= step.number ? 'text-amber-400' : 'text-gray-500'
                                    }`}>
                                    {step.title}
                                </p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`h-1 flex-1 mx-4 ${currentStep > step.number ? 'bg-amber-500/60' : 'bg-gray-800'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Content */}
            <div className="glass-card rounded-3xl border border-gray-700/50 p-8">
                {/* Step 1: Personal Info */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-white mb-6">Personal Information</h2>

                        <div>
                            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/60 rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all outline-none"
                                placeholder="e.g., John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/60 rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all outline-none"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">
                                No. Telepon <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/60 rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all outline-none"
                                placeholder="+62 812-3456-7890"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">
                                Photo URL (opsional)
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="url"
                                    value={formData.photoUrl}
                                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                                    className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700/60 rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all outline-none"
                                    placeholder="https://example.com/photo.jpg"
                                />
                                <button className="bg-gray-800/60 text-gray-300 px-4 py-3 rounded-xl hover:bg-gray-700/60 transition flex items-center gap-2 border border-gray-700/60">
                                    <CloudArrowUpIcon className="h-5 w-5" />
                                    Upload
                                </button>
                            </div>
                            {formData.photoUrl && (
                                <img
                                    src={formData.photoUrl}
                                    alt="Preview"
                                    className="mt-3 w-32 h-32 rounded-full object-cover border border-gray-700/50"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Professional Info */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-white mb-6">Professional Information</h2>

                        <div>
                            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">
                                Spesialisasi
                            </label>
                            <input
                                type="text"
                                value={formData.specialization}
                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/60 rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all outline-none"
                                placeholder="e.g., Fade Specialist, Classic Cuts"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">
                                Tahun Pengalaman
                            </label>
                            <input
                                type="number"
                                value={formData.yearsOfExperience}
                                onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/60 rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all outline-none"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">
                                Bio
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/60 rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all outline-none"
                                placeholder="Ceritakan tentang keahlian dan pengalaman..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">
                                Layanan yang Dikuasai
                            </label>
                            <div className="grid md:grid-cols-2 gap-3">
                                {services?.map(service => (
                                    <label
                                        key={service.id}
                                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${formData.serviceIds.includes(service.id)
                                                ? 'border-amber-500/60 bg-amber-500/10'
                                                : 'border-gray-800/70 hover:border-gray-700'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.serviceIds.includes(service.id)}
                                            onChange={() => toggleService(service.id)}
                                            className="w-5 h-5 text-amber-500"
                                        />
                                        <div className="flex-1">
                                            <p className="font-black text-white">{service.name}</p>
                                            <p className="text-sm text-gray-500">
                                                Rp {service.price.toLocaleString('id-ID')} • {service.duration} menit
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Commission & Schedule */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-white mb-6">Commission & Schedule</h2>

                        <div>
                            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">
                                Commission Rate (%)
                            </label>
                            <input
                                type="number"
                                value={formData.commissionRate}
                                onChange={(e) => setFormData({ ...formData, commissionRate: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/60 rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all outline-none"
                                min="0"
                                max="100"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Barber akan menerima {formData.commissionRate}% dari setiap transaksi
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">
                                Hari Kerja
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                                    <label
                                        key={day}
                                        className={`flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition ${formData.workingDays.includes(day)
                                                ? 'border-amber-500/60 bg-amber-500/10 text-amber-400'
                                                : 'border-gray-800/70 text-gray-400 hover:border-gray-700'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.workingDays.includes(day)}
                                            onChange={() => toggleWorkingDay(day)}
                                            className="sr-only"
                                        />
                                        <span className="font-black">
                                            {day.substring(0, 3)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">
                                    Jam Mulai
                                </label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/60 rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">
                                    Jam Selesai
                                </label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/60 rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-white mb-6">Review & Submit</h2>

                        <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Nama</p>
                                <p className="font-black text-white">{formData.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-black text-white">{formData.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Telepon</p>
                                <p className="font-black text-white">{formData.phoneNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Spesialisasi</p>
                                <p className="font-black text-white">{formData.specialization || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pengalaman</p>
                                <p className="font-black text-white">{formData.yearsOfExperience} tahun</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Layanan</p>
                                <p className="font-black text-white">
                                    {formData.serviceIds.length} layanan dipilih
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Commission Rate</p>
                                <p className="font-black text-white">{formData.commissionRate}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Hari Kerja</p>
                                <p className="font-black text-white">
                                    {formData.workingDays.join(', ')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Jam Kerja</p>
                                <p className="font-black text-white">
                                    {formData.startTime} - {formData.endTime}
                                </p>
                            </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                            <p className="text-sm text-amber-300">
                                ℹ️ Setelah barber ditambahkan, kredensial login akan dikirim ke email yang terdaftar.
                            </p>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-800/60">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2 px-6 py-3 border border-gray-700/60 rounded-xl font-black text-gray-300 hover:bg-gray-800/60 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Kembali
                    </button>

                    {currentStep < 4 ? (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-3 btn-premium text-sm tracking-widest"
                        >
                            Lanjut
                            <ArrowRightIcon className="h-5 w-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={createBarberMutation.isPending}
                            className="flex items-center gap-2 px-6 py-3 btn-premium text-sm tracking-widest disabled:opacity-50"
                        >
                            <CheckCircleIcon className="h-5 w-5" />
                            {createBarberMutation.isPending ? 'Menyimpan...' : 'Tambahkan Barber'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddBarber;
