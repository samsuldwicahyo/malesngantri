import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    PhoneIcon,
    MapPinIcon,
    ClockIcon,
    ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const BarbershopDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [selectedService, setSelectedService] = useState(null);

    // Fetch barbershop detail
    const { data: barbershop, isLoading } = useQuery({
        queryKey: ['barbershop', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/barbershops/${id}`);
            return data.data;
        }
    });

    // Fetch barbers
    const { data: barbers } = useQuery({
        queryKey: ['barbers', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/barbershops/${id}/barbers`);
            return data.data;
        },
        enabled: !!id
    });

    // Fetch services
    const { data: services } = useQuery({
        queryKey: ['services', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/barbershops/${id}/services`);
            return data.data;
        },
        enabled: !!id
    });

    // Create booking mutation
    const createBookingMutation = useMutation({
        mutationFn: async (bookingData) => {
            const { data } = await apiClient.post('/queues', bookingData);
            return data.data;
        },
        onSuccess: (data) => {
            toast.success('Booking berhasil! Anda akan menerima notifikasi WhatsApp.');
            navigate('/customer/my-queue');
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.error?.message || 'Booking gagal. Silakan coba lagi.';
            toast.error(errorMessage);
        }
    });

    const handleBooking = () => {
        if (!selectedBarber || !selectedService) {
            toast.error('Pilih barber dan layanan terlebih dahulu');
            return;
        }

        createBookingMutation.mutate({
            barbershopId: id,
            barberId: selectedBarber.id,
            serviceId: selectedService.id,
            scheduledDate: selectedDate,
            bookingType: 'ONLINE',
            customerName: user?.fullName,
            customerPhone: user?.phoneNumber
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-amber-500 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => navigate('/customer')}
                className="flex items-center gap-3 text-gray-400 hover:text-white mb-8 transition-all group"
            >
                <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 border border-gray-700/50 group-hover:border-amber-500/50">
                    <ChevronLeftIcon className="h-5 w-5" />
                </div>
                <span className="font-black text-xs uppercase tracking-widest">Kembali</span>
            </button>

            {/* Header */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden mb-10 border border-gray-700/50 shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>

                {/* Cover Image */}
                <div className="relative h-80 overflow-hidden">
                    <img
                        src={barbershop?.photoUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000'}
                        alt={barbershop?.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent"></div>
                    <div className="absolute bottom-8 left-8">
                        <h1 className="text-5xl font-black text-white mb-4 tracking-tight drop-shadow-2xl">{barbershop?.name}</h1>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center text-amber-500 bg-gray-950/40 px-3 py-1.5 rounded-xl border border-amber-500/20 backdrop-blur-md">
                                <StarIconSolid className="h-5 w-5" />
                                <span className="text-lg font-black ml-1">{barbershop?.averageRating?.toFixed(1) || '0.0'}</span>
                                <span className="text-xs font-bold text-gray-400 ml-2">({barbershop?.totalReviews || 0} reviews)</span>
                            </div>
                            {barbershop?.isOpen ? (
                                <span className="px-4 py-1.5 bg-green-500/20 text-green-500 text-xs font-black tracking-widest uppercase rounded-xl border border-green-500/30 backdrop-blur-md">Open Now</span>
                            ) : (
                                <span className="px-4 py-1.5 bg-red-500/20 text-red-500 text-xs font-black tracking-widest uppercase rounded-xl border border-red-500/30 backdrop-blur-md">Closed</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-10">
                    {/* Info Grid */}
                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="flex items-start gap-5">
                            <div className="bg-gray-900/50 p-3 rounded-2xl border border-gray-800">
                                <MapPinIcon className="h-6 w-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Alamat</p>
                                <p className="font-bold text-gray-200 text-sm leading-relaxed">{barbershop?.address}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-5">
                            <div className="bg-gray-900/50 p-3 rounded-2xl border border-gray-800">
                                <ClockIcon className="h-6 w-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Jam Operasional</p>
                                <p className="font-bold text-gray-200 text-sm">{barbershop?.openingTime} — {barbershop?.closingTime}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-5">
                            <div className="bg-gray-900/50 p-3 rounded-2xl border border-gray-800">
                                <PhoneIcon className="h-6 w-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Kontak Resmi</p>
                                <a href={`tel:${barbershop?.phoneNumber}`} className="font-black text-amber-500 hover:text-amber-400 transition-colors text-sm">
                                    {barbershop?.phoneNumber}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Section */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column - Selection */}
                <div className="md:col-span-2 space-y-6">
                    {/* Select Date */}
                    <div className="glass-card p-8 rounded-[2rem] border border-gray-700/50">
                        <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                            Pilih Tanggal
                        </h2>
                        <div className="relative group">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-6 py-4 bg-gray-900/50 border border-gray-700 shadow-inner rounded-2xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all outline-none appearance-none cursor-pointer font-bold"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500">
                                <ClockIcon className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    {/* Select Barber */}
                    <div className="glass-card p-8 rounded-[2rem] border border-gray-700/50">
                        <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                            Pilih Barber
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {barbers?.map((barber) => (
                                <div
                                    key={barber.id}
                                    onClick={() => setSelectedBarber(barber)}
                                    className={`p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-300 relative overflow-hidden group/barber ${selectedBarber?.id === barber.id
                                        ? 'border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-900/20 ring-4 ring-amber-500/10'
                                        : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="relative">
                                            <img
                                                src={barber.photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(barber.name) + '&background=f59e0b&color=fff'}
                                                alt={barber.name}
                                                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-gray-800"
                                            />
                                            {selectedBarber?.id === barber.id && (
                                                <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-1 shadow-lg">
                                                    <StarIconSolid className="h-4 w-4" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-black text-white group-hover/barber:text-amber-500 transition-colors uppercase tracking-tight">{barber.name}</h3>
                                            <div className="flex items-center gap-1 text-xs font-black text-amber-500/70 mt-1 uppercase tracking-widest">
                                                <StarIconSolid className="h-3 w-3" />
                                                <span>{barber.averageRating?.toFixed(1) || '0.0'}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-500 mt-2 line-clamp-1 italic">{barber.specializations?.join(' • ')}</p>
                                        </div>
                                    </div>
                                    {barber.activeQueues > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {barber.activeQueues} Waiting
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Select Service */}
                    <div className="glass-card p-8 rounded-[2rem] border border-gray-700/50">
                        <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                            Pilih Layanan
                        </h2>
                        <div className="grid gap-4">
                            {services?.map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className={`p-6 rounded-2xl border-2 transition-all duration-300 group/service ${selectedService?.id === service.id
                                        ? 'border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-900/20'
                                        : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-black text-white group-hover/service:text-amber-500 transition-colors uppercase tracking-tight">{service.name}</h3>
                                            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-tight">{service.description}</p>
                                            <div className="flex items-center gap-4 mt-4">
                                                <div className="flex items-center gap-2 bg-gray-900/50 px-3 py-1 rounded-lg border border-gray-800 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                                    <ClockIcon className="h-3.5 w-3.5 text-amber-500" />
                                                    {service.duration} Min
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-amber-500">
                                                Rp {service.price.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Summary */}
                <div className="md:col-span-1">
                    <div className="glass-card p-8 rounded-[2rem] border border-gray-700/50 sticky top-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h2 className="text-xl font-black text-white mb-8 border-b border-gray-800 pb-4 uppercase tracking-[0.2em]">Summary</h2>

                        <div className="space-y-8 mb-10">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">Selected Date</p>
                                <p className="font-black text-gray-200 text-sm">{new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>

                            {selectedBarber && (
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">Master Barber</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-glow-amber"></div>
                                        <p className="font-black text-gray-200 text-sm tracking-tight">{selectedBarber.name}</p>
                                    </div>
                                </div>
                            )}

                            {selectedService && (
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">Premium Service</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-glow-amber"></div>
                                        <p className="font-black text-gray-200 text-sm tracking-tight">{selectedService.name}</p>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest ml-[18px]">Est. Duration: {selectedService.duration} min</p>
                                </div>
                            )}

                            {selectedService && (
                                <div className="pt-8 border-t border-gray-800">
                                    <div className="flex items-end justify-between">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Estimated Total</span>
                                        <span className="text-4xl font-black text-amber-500 drop-shadow-glow-amber">
                                            Rp {selectedService.price.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleBooking}
                            disabled={!selectedBarber || !selectedService || createBookingMutation.isPending}
                            className="btn-premium w-full py-5 text-xl relative group"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {createBookingMutation.isPending ? (
                                    <>
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Proses...</span>
                                    </>
                                ) : (
                                    'Book Appointment'
                                )}
                            </span>
                        </button>

                        <p className="text-[10px] font-black text-gray-600 text-center mt-6 tracking-widest uppercase">
                            Confirmation via WhatsApp
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarbershopDetail;
