const Reports = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
                <p className="text-gray-600 mt-1">Analisis performa barbershop Anda</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-gray-500 mb-6">
                    Fitur analytics lengkap dengan charts, export PDF/Excel, dan insights akan segera hadir
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                    <h4 className="font-semibold text-blue-900 mb-2">Fitur yang akan datang:</h4>
                    <ul className="text-sm text-blue-800 text-left space-y-1">
                        <li>✅ Revenue trends (daily, weekly, monthly)</li>
                        <li>✅ Service popularity analysis</li>
                        <li>✅ Barber performance comparison</li>
                        <li>✅ Customer retention metrics</li>
                        <li>✅ Peak hours heatmap</li>
                        <li>✅ Export reports (PDF, Excel)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Reports;
