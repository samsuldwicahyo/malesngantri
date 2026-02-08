const Schedule = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Jadwal Kerja</h2>

                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Fitur Segera Hadir</h3>
                    <p className="text-gray-500">
                        Kelola jadwal kerja mingguan Anda di sini
                    </p>
                </div>
            </div>

            {/* Preview of what's coming */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-2">Fitur yang akan datang:</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li>✅ Set jadwal kerja per hari (Senin - Minggu)</li>
                    <li>✅ Atur jam kerja (mulai & selesai)</li>
                    <li>✅ Tandai hari libur</li>
                    <li>✅ Recurring schedule template</li>
                    <li>✅ Break time management</li>
                </ul>
            </div>
        </div>
    );
};

export default Schedule;
