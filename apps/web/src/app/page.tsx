import Link from 'next/link';

const roles = [
  {
    title: 'Customer',
    route: '/{tenantSlug}',
    description:
      'Daftar, login, pilih barber, pilih layanan, dapat nomor antrean, pantau status, dan bisa cancel.',
  },
  {
    title: 'Admin Barber',
    route: '/{tenantSlug}/admin',
    description:
      'Kelola profil toko, barber, layanan, antrean online dan offline, plus komunikasi WhatsApp manual.',
  },
  {
    title: 'Pemangkas Rambut',
    route: '/{tenantSlug}/admin',
    description:
      'Melihat antrean kerja, update status menjadi serving atau done, dan cek estimasi waktu layanan.',
  },
  {
    title: 'Super Admin',
    route: '/',
    description:
      'Kelola tenant, paket langganan, aktivasi atau nonaktif tenant tanpa masuk operasional antrean harian.',
  },
];

const queueStatuses = ['WAITING', 'CALLED', 'SERVING', 'DONE', 'NO_SHOW', 'CANCELED'];

const capabilities = [
  'Multi-tenant path routing `/:tenantSlug`',
  'Role-based access untuk customer, admin barber, barber, super admin',
  'Update antrean realtime tanpa refresh halaman',
  'Input customer offline ke antrean yang sama',
  'WhatsApp manual dari panel admin (privasi nomor terjaga)',
  'Tenant aktif hanya saat langganan ACTIVE',
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.2),transparent_35%),radial-gradient(circle_at_100%_0%,rgba(251,113,133,0.2),transparent_30%),#05070c] text-neutral-100">
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-8">
        <header className="rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-400 font-black text-rose-950">
                M
              </div>
              <div>
                <p className="text-lg font-black tracking-tight">Malas Ngantri</p>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Barbershop Queue SaaS</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/auth/register"
                className="rounded-xl bg-rose-400 px-4 py-2 text-xs font-black uppercase tracking-widest text-rose-950"
              >
                Daftarkan Barbershop
              </Link>
              <Link
                href="/auth/login"
                className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/10"
              >
                Login
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 py-12 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">Skripsi Project</p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              Platform SaaS Manajemen Antrean Barbershop
              <span className="block text-rose-300">dengan Arsitektur Multi-Tenant</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-300 md:text-base">
              Domain utama berada di `malesngantri.com`, setiap tenant memiliki route isolasi data di
              `/:tenantSlug` dan dashboard internal di `/:tenantSlug/admin`.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/barber-jaya"
                className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black uppercase tracking-widest text-cyan-950"
              >
                Coba Halaman Customer
              </Link>
              <Link
                href="/barber-jaya/admin"
                className="rounded-2xl bg-rose-300 px-5 py-3 text-sm font-black uppercase tracking-widest text-rose-950"
              >
                Coba Dashboard Admin
              </Link>
              <Link
                href="/super-admin"
                className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-bold uppercase tracking-widest hover:bg-white/10"
              >
                Panel Super Admin
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/45 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-400">Routing Domain</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2">
                <p className="font-bold text-cyan-200">malesngantri.com</p>
                <p className="text-neutral-400">Landing page, registrasi barbershop, super admin.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2">
                <p className="font-bold text-rose-200">malesngantri.com/barber-jaya</p>
                <p className="text-neutral-400">Halaman customer tenant.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2">
                <p className="font-bold text-amber-200">malesngantri.com/barber-jaya/admin</p>
                <p className="text-neutral-400">Panel admin barber dan pemangkas.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Aktor dan Peran</h2>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Role-Based Access</p>
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
          <article className="rounded-3xl border border-white/10 bg-black/40 p-6">
            <h2 className="text-2xl font-black">Status Antrean Standar</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Status ini dipakai konsisten untuk halaman customer dan dashboard admin.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {queueStatuses.map((status) => (
                <span
                  key={status}
                  className="rounded-full border border-white/20 bg-neutral-900 px-3 py-1 text-xs font-black tracking-widest"
                >
                  {status}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-black/40 p-6">
            <h2 className="text-2xl font-black">Kebutuhan Sistem</h2>
            <ul className="mt-4 space-y-2 text-sm text-neutral-300">
              {capabilities.map((item) => (
                <li key={item} className="rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="mt-6 rounded-3xl border border-cyan-200/20 bg-cyan-400/10 p-6">
          <h2 className="text-2xl font-black text-cyan-100">Mulai dari Tenant Demo</h2>
          <p className="mt-2 max-w-3xl text-sm text-cyan-50/90">
            Untuk uji flow skripsi, gunakan tenant `barber-jaya`. Customer bisa antre di route tenant,
            admin bisa update status dari panel admin tenant, dan perubahan akan sinkron realtime.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/barber-jaya" className="rounded-xl bg-white px-4 py-2 text-sm font-black text-cyan-900">
              Buka /barber-jaya
            </Link>
            <Link
              href="/barber-jaya/admin"
              className="rounded-xl border border-white/50 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
            >
              Buka /barber-jaya/admin
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
