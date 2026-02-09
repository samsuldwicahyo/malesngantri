const Favorites = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Favorit Saya</h1>
                <p className="text-gray-600 mt-1">Barbershop dan barber favorit Anda</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">⭐</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Fitur Segera Hadir</h2>
                <p className="text-gray-600">Simpan barbershop dan barber favorit Anda untuk akses cepat</p>
            </div>
        </div>
    );
};

export default Favorites;
