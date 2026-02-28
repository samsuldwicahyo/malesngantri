# Malas Ngantri - UI Design Showcase

Repository ini adalah **project desain UI** untuk konsep platform SaaS barbershop “Malas Ngantri”.

Fokus project ini ada pada:

- Tampilan landing page
- Tampilan panel admin barber
- Tampilan panel worker
- Tampilan panel superadmin
- Komposisi layout, warna, komponen, dan flow visual

## Link Repository

- https://github.com/samsuldwicahyo/malesngantri

## Status Project

Project ini saya posisikan sebagai **design/prototype**.

Yang ada di repo ini:

- Desain antarmuka (UI)
- Struktur halaman frontend
- Komponen visual
- Galeri screenshot hasil desain

Yang **tidak** menjadi fokus utama di project ini:

- Implementasi backend production-ready
- Integrasi data end-to-end yang stabil
- Hardening auth/security/deployment production

## Menjalankan Project (Untuk Preview UI)

## 1) Clone repository

```bash
git clone https://github.com/samsuldwicahyo/malesngantri.git
cd malesngantri
```

## 2) Jalankan frontend

```bash
cd apps/web
npm install
npm run dev
```

Buka di browser:

- `http://localhost:3001`

Catatan:

- Karena project ini fokus desain UI, beberapa halaman yang butuh API bisa menampilkan pesan seperti `Failed to fetch` jika backend tidak aktif.
- Untuk penilaian desain, gunakan galeri screenshot di bawah.

## Teknologi (UI)

- Next.js
- React
- TypeScript
- CSS utility/component styling

## Galeri UI

File ada di folder `docs/screenshots/`.

![Admin - Booking Hari Ini](docs/screenshots/admin-booking.png)
![Admin - Worker](docs/screenshots/admin-worker.png)
![Admin - Layanan](docs/screenshots/admin-layanan.png)
![Admin - Jadwal](docs/screenshots/admin-jadwal.png)
![Admin - Branding](docs/screenshots/admin-branding.png)
![Tenant Public](docs/screenshots/tenant-public.png)
![Tenant Public - Layanan & Worker](docs/screenshots/tenant-worker-layanan.png)
![Landing - Fitur](docs/screenshots/landing-fitur.png)
![Landing - Harga](docs/screenshots/landing-harga.png)
![Superadmin - Login](docs/screenshots/superadmin-login.png)
![Superadmin - Dashboard](docs/screenshots/superadmin-dashboard.png)

## Struktur Folder Utama

- `apps/web` - source frontend UI
- `docs/screenshots` - screenshot tampilan UI
- `backend` - eksperimen/pengembangan backend (bukan fokus utama untuk showcase desain)

## Catatan Singkat

Jika tujuan kamu adalah menilai hasil kerja saya, maka repositori ini merepresentasikan kemampuan saya di area:

- UI layouting
- Konsistensi visual
- Desain flow halaman produk
