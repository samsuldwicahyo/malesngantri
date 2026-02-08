import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { LockClosedIcon, EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const schema = yup.object().shape({
    username: yup.string().required('Username atau Email wajib diisi'),
    password: yup.string().min(6, 'Password minimal 6 karakter').required('Password wajib diisi'),
});

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await login(data);
            toast.success('Login berhasil!');

            const role = result.user.role;
            if (role === 'CUSTOMER') navigate('/customer');
            else if (role === 'BARBER') navigate('/barber');
            else if (role === 'ADMIN') navigate('/admin');
            else if (role === 'SUPER_ADMIN') navigate('/super-admin');
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Login gagal');
            toast.error(err.response?.data?.error?.message || 'Login gagal');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-mesh flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[150px]"></div>

            <Link
                to="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition group"
            >
                <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 border border-gray-700 group-hover:border-gray-600">
                    <ArrowLeftIcon className="h-5 w-5" />
                </div>
                <span className="font-medium">Kembali</span>
            </Link>

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
                        Malas<span className="text-gradient-amber">Ngantri</span>
                    </h1>
                    <p className="text-gray-400 font-medium">Masuk untuk mengelola antrian Anda</p>
                </div>

                <div className="glass-card p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-300 ml-1">Nama Pengguna / Email</label>
                            <div className="relative group">
                                <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    {...register('username')}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all outline-none placeholder:text-gray-600"
                                    placeholder="Masukkan username atau email"
                                />
                                {errors.username && (
                                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.username.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-gray-300">Kata Sandi</label>
                                <a href="#" className="text-xs font-bold text-amber-500 hover:text-amber-400 transition">Lupa password?</a>
                            </div>
                            <div className="relative group">
                                <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    {...register('password')}
                                    type="password"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all outline-none placeholder:text-gray-600"
                                    placeholder="••••••••"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                                <span className="text-lg">⚠️</span> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-premium w-full py-4 text-lg"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Memproses...</span>
                                </div>
                            ) : (
                                'Masuk Sekarang'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-700/50 text-center">
                        <p className="text-gray-400 text-sm">
                            Belum punya akun?{' '}
                            <Link to="/register" className="text-amber-500 font-bold hover:text-amber-400 transition">
                                Daftar Gratis
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-8 text-gray-500 text-xs font-medium tracking-wider">
                    SECURED BY MALASNGANTRI SHIELD
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
