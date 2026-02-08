const SubscriptionInfo = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Subscription & Billing</h1>
                <p className="text-gray-400 mt-1">Kelola paket subscription dan billing Anda</p>
            </div>

            <div className="bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-700">
                <div className="text-gray-500 text-6xl mb-4">💳</div>
                <h3 className="text-xl font-semibold text-white mb-2">Subscription Management Coming Soon</h3>
                <p className="text-gray-400 mb-6">
                    Lihat paket aktif, riwayat pembayaran, dan upgrade subscription
                </p>

                <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-6 max-w-md mx-auto">
                    <h4 className="font-semibold text-amber-500 mb-4 text-center">Fitur yang akan datang:</h4>
                    <ul className="text-sm text-gray-300 text-left space-y-3">
                        <li className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold">✓</span> Current plan details
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold">✓</span> Usage statistics
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold">✓</span> Billing history
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold">✓</span> Upgrade/downgrade plan
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold">✓</span> Payment method management
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold">✓</span> Invoice download
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionInfo;
