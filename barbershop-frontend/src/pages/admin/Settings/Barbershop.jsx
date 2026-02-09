const BarbershopSettings = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Barbershop Settings</h1>
                <p className="text-gray-400 mt-1">Kelola informasi dan pengaturan barbershop Anda</p>
            </div>

            <div className="bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-700">
                <div className="text-gray-500 text-6xl mb-4">⚙️</div>
                <h3 className="text-xl font-semibold text-white mb-2">Settings Feature Coming Soon</h3>
                <p className="text-gray-400 mb-6">
                    Kelola informasi barbershop, jam operasional, dan pengaturan lainnya
                </p>

                <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-6 max-w-md mx-auto">
                    <h4 className="font-semibold text-amber-500 mb-4 text-center">Pengaturan yang akan datang:</h4>
                    <ul className="text-sm text-gray-300 text-left space-y-3">
                        <li className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold">✓</span> Edit info barbershop (nama, alamat, foto)
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold">✓</span> Jam operasional
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold">✓</span> Hari libur
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold">✓</span> Notifikasi settings
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold">✓</span> Payment gateway integration
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold">✓</span> Social media links
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BarbershopSettings;
