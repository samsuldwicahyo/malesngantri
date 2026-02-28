import Link from 'next/link';
import { ArrowRight, BarChart3, CalendarClock, Layers3, Scissors, Users2, MessageCircleMore, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: 'Time-Slot Booking',
    description: 'Booking berdasarkan jam, bukan nomor antrean manual.',
    icon: CalendarClock,
  },
  {
    title: 'Worker Management',
    description: 'Kelola worker, akses role, dan performa operasional dari satu panel.',
    icon: Users2,
  },
  {
    title: 'Auto Schedule',
    description: 'Atur jam operasional, slot tutup, dan pencegahan bentrok booking.',
    icon: Scissors,
  },
  {
    title: 'Multi-Tenant',
    description: 'Data tiap barber terisolasi aman di route slug masing-masing.',
    icon: Layers3,
  },
  {
    title: 'Analytics',
    description: 'Lihat booking harian, status layanan, dan ringkasan performa.',
    icon: BarChart3,
  },
  {
    title: 'WhatsApp Integration',
    description: 'Konfirmasi dan komunikasi customer langsung via WhatsApp.',
    icon: MessageCircleMore,
  },
];

const steps = [
  {
    title: 'Daftar Barber',
    description: 'Buat tenant barber Anda dalam hitungan menit.',
  },
  {
    title: 'Atur Layanan & Jadwal',
    description: 'Tambahkan layanan, worker, dan jam operasional secara fleksibel.',
  },
  {
    title: 'Customer Booking Online',
    description: 'Customer pilih layanan, worker, tanggal, dan jam langsung dari website.',
  },
];

const plans = [
  {
    name: 'Starter',
    price: 'Rp149k/bln',
    note: 'Untuk barber yang baru mulai digitalisasi booking.',
    benefits: ['1 tenant barber', 'Manajemen booking', 'Manajemen worker'],
    recommended: false,
  },
  {
    name: 'Pro',
    price: 'Rp299k/bln',
    note: 'Pilihan terbaik untuk barber yang butuh operasional stabil.',
    benefits: ['Semua fitur Starter', 'Branding lanjutan', 'Analytics + closed slot'],
    recommended: true,
  },
  {
    name: 'Scale',
    price: 'Custom',
    note: 'Untuk network barber dan kebutuhan enterprise.',
    benefits: ['Semua fitur Pro', 'Support prioritas', 'Kustom integrasi'],
    recommended: false,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen text-neutral-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-xl">
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 font-black text-neutral-950">
              M
            </span>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em]">Malas Ngantri</p>
              <p className="text-xs text-neutral-400">Barber SaaS Platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <a href="#fitur" className="text-neutral-300 hover:text-white">Fitur</a>
            <a href="#harga" className="text-neutral-300 hover:text-white">Harga</a>
            <a href="#cara-kerja" className="text-neutral-300 hover:text-white">Cara Kerja</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/super-admin" className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white">
              Login Superadmin
            </Link>
            <Link href="#harga">
              <Button variant="primary" size="sm">Daftarkan Barber</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Badge variant="warning">SaaS Multi-Tenant untuk Bisnis Barber</Badge>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Hentikan antrean kacau.
            <span className="block text-amber-400">Ubah jadi booking time-slot profesional.</span>
          </h1>
          <p className="max-w-2xl text-base text-neutral-300 sm:text-lg">
            Malas Ngantri membantu barber menjual branding digital sekaligus mengelola booking online,
            worker, layanan, jadwal, dan operasional tenant dalam satu platform.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="#harga">
              <Button variant="primary" size="lg">
                Daftarkan Barber
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/barber-jaya">
              <Button variant="secondary" size="lg">Lihat Demo</Button>
            </Link>
          </div>
        </div>

        <Card className="space-y-4">
          <CardTitle>Kenapa Barber Pilih Malas Ngantri</CardTitle>
          <CardDescription>
            Fokus pada omzet dan kualitas layanan, bukan drama pengelolaan antrean.
          </CardDescription>
          <ul className="space-y-3 text-sm text-neutral-200">
            <li className="flex items-start gap-2"><Check size={15} className="mt-0.5 text-emerald-300" /> Booking real-time langsung dari website tenant.</li>
            <li className="flex items-start gap-2"><Check size={15} className="mt-0.5 text-emerald-300" /> Worker login dengan role terpisah dari admin.</li>
            <li className="flex items-start gap-2"><Check size={15} className="mt-0.5 text-emerald-300" /> Superadmin global untuk kontrol subscription tenant.</li>
          </ul>
        </Card>
      </section>

      <section id="fitur" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-3">
          <h2 className="text-3xl font-black">Fitur Utama</h2>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Core Platform</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="space-y-3">
              <feature.icon size={20} className="text-amber-300" />
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <section id="cara-kerja" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-6">
          <h2 className="text-3xl font-black">Cara Kerja</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="space-y-3">
              <Badge variant="info">Langkah {index + 1}</Badge>
              <CardTitle>{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <section id="harga" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-6">
          <h2 className="text-3xl font-black">Harga</h2>
          <p className="mt-2 text-sm text-neutral-400">Pilih paket sesuai tahap pertumbuhan barber Anda.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.recommended ? 'border-amber-300/40 bg-amber-500/10' : ''}
            >
              {plan.recommended ? <Badge variant="warning">Recommended</Badge> : null}
              <h3 className="mt-3 text-xl font-black">{plan.name}</h3>
              <p className="mt-1 text-2xl font-black text-amber-300">{plan.price}</p>
              <p className="mt-2 text-sm text-neutral-300">{plan.note}</p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-200">
                {plan.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-300" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" variant={plan.recommended ? 'primary' : 'secondary'}>
                Subscribe
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <footer className="mt-10 border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Malas Ngantri. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white">Syarat Layanan</a>
            <a href="#" className="hover:text-white">Instagram</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
