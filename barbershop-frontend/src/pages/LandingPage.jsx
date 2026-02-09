import { Link } from 'react-router-dom';

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-4xl w-full text-center space-y-8 z-10">
                <div className="space-y-4">
                    <div className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-semibold mb-4 tracking-wider uppercase">
                        SaaS Queue Management for Barbers
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-tight">
                        Malas<span className="text-gradient-amber">Ngantri</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Revolusi antrian barbershop. Hemat waktu customer, mudahkan manajemen barbershop Anda.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                    <Link
                        to="/login"
                        className="btn-premium w-full sm:w-auto"
                    >
                        Login ke Dashboard
                    </Link>
                    <Link
                        to="/register"
                        className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-bold transition-all border border-gray-700 hover:border-gray-600 backdrop-blur-sm w-full sm:w-auto text-center"
                    >
                        Daftar Barbershop
                    </Link>
                </div>

                {/* Feature Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
                    {[
                        { title: 'Real-time Queue', icon: '⚡', desc: 'Pantau antrian secara real-time dari mana saja.' },
                        { title: 'Easy Scheduling', icon: '📅', desc: 'Booking dalam hitungan detik tanpa ribet.' },
                        { title: 'Smart Analytics', icon: '📈', desc: 'Analisa performa bisnis Anda dengan mudah.' }
                    ].map((feature, i) => (
                        <div key={i} className="glass-card p-6 rounded-2xl text-left hover:scale-105 transition-transform duration-300">
                            <div className="text-3xl mb-4">{feature.icon}</div>
                            <h3 className="font-bold text-lg text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="absolute bottom-8 text-gray-500 text-sm font-medium tracking-wide">
                &copy; 2026 MalasNgantri Barber. Crafted for Excellence.
            </footer>
        </div>
    );
};

export default LandingPage;
