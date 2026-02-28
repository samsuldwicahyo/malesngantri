import Link from 'next/link';

const roles = [
  {
    title: 'Customer (Pelanggan)',
    route: '/t/{nama-barber}',
    description:
      'Daftar ringan pakai WhatsApp, pilih pemangkas, pilih layanan, pilih jam, lalu booking dari rumah.',
  },
  {
    title: 'Worker (Pemangkas Rambut)',
    route: '/t/{nama-barber}/admin',
    description:
      'Menerima booking baru, konfirmasi pelanggan sudah datang, mulai layanan, lalu selesaikan.',
  },
  {
    title: 'Admin Barber (Pemilik Usaha)',
    route: '/t/{nama-barber}/admin',
    description:
      'Kelola worker, jadwal, layanan, booking pelanggan, serta branding landing page barber.',
  },
  {
    title: 'Superadmin Platform',
    route: '/',
    description:
      'Kelola tenant, paket, status subscription, dan monitoring platform SaaS.',
  },
];

const bookingStatuses = [
  'Sudah Booking (BOOKED)',
  'Sudah Datang (CHECKED_IN)',
  'Sedang Dilayani (IN_SERVICE)',
  'Selesai (DONE)',
  'Dibatalkan (CANCELED)',
  'Tidak Hadir (NO_SHOW)',
];

const valuePropositions = [
  'Website siap pakai untuk promosi usaha barber',
  'Sistem booking berbasis jam (bukan antrean manual)',
  'Update status langsung terlihat oleh pelanggan',
  'SaaS subscription bulanan / tahunan',
  'Single-business tenant: data tiap barber terisolasi',
  'Tampilan sederhana dan nyaman di HP',
];

const glossary = [
  { term: 'Tenant', meaning: 'Satu akun usaha barber yang berlangganan.' },
  { term: 'Worker', meaning: 'Pemangkas rambut yang melayani pelanggan.' },
  { term: 'Time-Slot', meaning: 'Jam booking, contoh 10:30 atau 14:00.' },
  { term: 'Check-In', meaning: 'Tanda bahwa pelanggan sudah datang ke lokasi.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,rgba(34,211,238,0.2),transparent_35%),radial-gradient(circle_at_100%_0%,rgba(251,113,133,0.2),transparent_30%),#04070e] text-neutral-100">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <header className="rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300 font-black text-cyan-950">
                M
              </div>
              <div>
                <p className="text-lg font-black tracking-tight">Malas Ngantri</p>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                  Website Booking Barber
                </p>
              </div>
            </div>
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              <Link
                href="/auth/register"
                className="w-full rounded-xl bg-rose-400 px-4 py-2 text-center text-xs font-black uppercase tracking-widest text-rose-950 sm:w-auto"
              >
                Daftarkan Usaha Barber
              </Link>
              <Link
                href="/auth/login"
                className="w-full rounded-xl border border-white/20 px-4 py-2 text-center text-xs font-bold uppercase tracking-widest hover:bg-white/10 sm:w-auto"
              >
                Login Dashboard
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 py-12 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">B2B SaaS - Booking First</p>
            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl md:text-6xl">
              Website + Booking Online Barber
              <span className="block text-rose-300">untuk Usaha Perorangan</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-300 md:text-base">
              Malas Ngantri adalah produk `SaaS` yang menggabungkan website branding + sistem booking
              time-slot online, sehingga pelanggan bisa memesan layanan tanpa harus menunggu antrean
              fisik di lokasi.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/t/barber-jaya"
                className="w-full rounded-2xl bg-cyan-300 px-5 py-3 text-center text-sm font-black uppercase tracking-widest text-cyan-950 sm:w-auto"
              >
                Lihat Contoh Halaman Barber
              </Link>
              <Link
                href="/t/barber-jaya/admin"
                className="w-full rounded-2xl bg-rose-300 px-5 py-3 text-center text-sm font-black uppercase tracking-widest text-rose-950 sm:w-auto"
              >
                Lihat Dashboard Admin
              </Link>
              <Link
                href="/super-admin"
                className="w-full rounded-2xl border border-white/20 px-5 py-3 text-center text-sm font-bold uppercase tracking-widest hover:bg-white/10 sm:w-auto"
              >
                Panel Superadmin
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/45 p-4 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-400">Routing Multi-Tenant</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2">
                <p className="font-bold text-cyan-200">malesngantri.com</p>
                <p className="text-neutral-400">Landing utama, registrasi tenant, dan superadmin.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2">
                <p className="font-bold text-rose-200">malesngantri.com/t/barber-jaya</p>
                <p className="text-neutral-400">Landing publik tenant + tombol booking online.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2">
                <p className="font-bold text-amber-200">malesngantri.com/t/barber-jaya/admin</p>
                <p className="text-neutral-400">Dashboard admin barber dan worker/pemangkas.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/40 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Peran Pengguna</h2>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Role & Permission Berlapis</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <article key={role.title} className="rounded-2xl border border-white/10 bg-neutral-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">{role.route}</p>
                <h3 className="mt-2 text-lg font-black text-cyan-100">{role.title}</h3>
                <p className="mt-2 text-sm text-neutral-300">{role.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-3xl border border-white/10 bg-black/40 p-4 sm:p-6">
            <h2 className="text-2xl font-black">Alur Status Booking</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Flow utama: BOOKED -&gt; CHECKED_IN -&gt; IN_SERVICE -&gt; DONE dengan status tambahan
              CANCELED dan NO_SHOW.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {bookingStatuses.map((status) => (
                <span
                  key={status}
                  className="rounded-full border border-white/20 bg-neutral-900 px-3 py-1 text-xs font-black tracking-widest"
                >
                  {status}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-black/40 p-4 sm:p-6">
            <h2 className="text-2xl font-black">Nilai Produk</h2>
            <ul className="mt-4 space-y-2 text-sm text-neutral-300">
              {valuePropositions.map((item) => (
                <li key={item} className="rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="mt-6 rounded-3xl border border-cyan-200/20 bg-cyan-400/10 p-4 sm:p-6">
          <h2 className="text-2xl font-black text-cyan-100">Kamus Istilah Singkat</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {glossary.map((item) => (
              <div key={item.term} className="rounded-xl border border-cyan-100/20 bg-cyan-950/30 p-3">
                <p className="text-sm font-black text-cyan-100">{item.term}</p>
                <p className="mt-1 text-xs text-cyan-50/90">{item.meaning}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-cyan-200/20 bg-cyan-400/10 p-4 sm:p-6">
          <h2 className="text-2xl font-black text-cyan-100">Positioning Produk</h2>
          <p className="mt-2 max-w-3xl text-sm text-cyan-50/90">
            Produk ini bukan sekadar sistem antrean. Positioning utamanya adalah:
            `Website siap pakai + sistem booking + branding digital untuk barber perorangan`.
            Ini nilai jual yang kuat karena barber dapat operasional dan promosi dari satu platform.
          </p>
        </section>
      </div>
    </main>
  );
}
