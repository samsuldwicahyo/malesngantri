import Link from 'next/link';


export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto backdrop-blur-md bg-black/50 sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg rotate-12 flex items-center justify-center font-bold text-black border-2 border-white/10">M</div>
          <span className="text-xl font-bold tracking-tighter">MALAS<span className="text-amber-500">NGANTRI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
          <Link href="#features" className="hover:text-amber-500 transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-amber-500 transition-colors">Pricing</Link>
          <Link href="#about" className="hover:text-amber-500 transition-colors">About</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-4 py-2 text-sm font-medium hover:text-amber-500 transition-colors">Login</Link>
          <Link href="/register" className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.3)]">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-500 text-xs font-semibold uppercase tracking-widest mb-6 animate-fade-in">
            New Era of Grooming Management
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tightest leading-tight mb-8">
            Antre Itu <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-400 italic">Kuno</span>, <br />
            Modern Itu <span className="underline decoration-amber-500/50 underline-offset-8">Gampang.</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Platform manajemen antrian barbershop tercanggih. Estimasi real-time,
            notifikasi WhatsApp otomatis, dan efisiensi barber yang meningkat.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/booking" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black px-10 py-5 rounded-2xl text-lg font-bold transition-all hover:-translate-y-1 shadow-[0_10px_40px_rgba(245,158,11,0.4)]">
              Cari Barbershop
            </Link>
            <Link href="/partner" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-5 rounded-2xl text-lg font-bold transition-all hover:-translate-y-1">
              Daftarkan Barbershop Anda
            </Link>
          </div>
        </div>
      </section>

      {/* Stats mockup */}
      <section className="px-6 py-20 bg-neutral-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-black text-amber-500 mb-2">500+</div>
            <div className="text-sm uppercase tracking-widest text-neutral-500 font-bold">Barbershops</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-white mb-2">1M+</div>
            <div className="text-sm uppercase tracking-widest text-neutral-500 font-bold">Cuts Managed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-white mb-2">99%</div>
            <div className="text-sm uppercase tracking-widest text-neutral-500 font-bold">Customer Happy</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-white mb-2">0</div>
            <div className="text-sm uppercase tracking-widest text-neutral-500 font-bold">Bad Hair Days</div>
          </div>
        </div>
      </section>

      {/* Dynamic Queue Card Demo */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              Lacak Antrian Secara <br />
              <span className="text-amber-500">Real-Time.</span>
            </h2>
            <p className="text-lg text-neutral-400 mb-8 leading-relaxed">
              Customer tidak perlu lagi menebak kapan giliran mereka. Algoritma kami
              menghitung estimasi berdasarkan kecepatan historical barber dan durasi layanan.
            </p>
            <ul className="space-y-4">
              {['Live Tracker Dashboard', 'WhatsApp T-30 Reminder', 'Dynamic Wait Times'].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xs cursor-default">✓</div>
                  <span className="font-medium text-neutral-200">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-neutral-900 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2.6rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold">Antrian Anda</h3>
                  <p className="text-sm text-neutral-500">The Gentlemen Barbershop</p>
                </div>
                <div className="bg-amber-500/10 text-amber-500 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-amber-500/20">
                  On Chain
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-neutral-800 border border-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-neutral-500 text-sm font-medium uppercase tracking-wider">Estimasi Tunggu</span>
                    <span className="text-3xl font-black text-amber-500">12 Menit</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-700 rounded-full overflow-hidden">
                    <div className="h-full w-[80%] bg-gradient-to-r from-amber-500 to-orange-500" />
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-3xl bg-neutral-950/50 border border-white/5 items-center">
                  <div className="w-12 h-12 bg-neutral-800 rounded-full border border-white/10" />
                  <div>
                    <div className="font-bold text-white">Barber Rudi</div>
                    <div className="text-xs text-neutral-500 font-medium">Haircut & Styling</div>
                  </div>
                  <div className="ml-auto text-amber-500 font-black">#3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-neutral-600 text-sm font-medium uppercase tracking-widest">
        &copy; 2026 MalasNgantri Platform. Built with 🔥
      </footer>
    </div>
  );
}
