# Malas Ngantri

Malas Ngantri adalah platform SaaS untuk barbershop dengan sistem booking berbasis **time-slot**. Sistem ini mendukung model **multi-tenant** (setiap barber punya slug/halaman sendiri), dilengkapi panel operasional untuk admin, worker, dan superadmin.

## Fitur Utama

- Booking online berbasis jam (slot), bukan nomor antrean manual
- Multi-tenant per slug (contoh: `/the-gentleman-barber`)
- Panel Admin Barber:
  - Kelola worker
  - Kelola layanan
  - Kelola slot tutup/libur dan jam operasional
  - Branding landing page tenant
  - Monitoring booking harian
- Panel Worker:
  - Melihat booking sesuai scope worker
  - Update status layanan
  - Update profil worker
- Panel Superadmin:
  - Monitoring tenant
  - Kontrol status tenant/subscription
- Realtime update status booking (Socket.IO)

## Teknologi

- Frontend: Next.js (App Router), React, TypeScript
- Backend: Express.js, Prisma ORM
- Database: PostgreSQL
- Realtime: Socket.IO
- Infra lokal: Docker Compose (PostgreSQL + Redis)

## Struktur Repository

- `apps/web` - Frontend utama (aktif)
- `backend` - API utama Express + Prisma (aktif)
- `apps/api-service` - service lama/deprecated
- `docs` - dokumentasi proyek

## Prasyarat

Pastikan sudah ter-install:

- Node.js 20+
- npm 10+
- Docker Desktop / Docker Engine
- Git

## Instalasi dan Menjalankan Proyek

## 1) Clone repository

```bash
git clone https://github.com/samsuldwicahyo/malesngantri.git
cd malesngantri
```

## 2) Jalankan database services (PostgreSQL + Redis)

```bash
docker compose up -d
```

Cek container:

```bash
docker ps
```

## 3) Setup backend

```bash
cd backend
npm install
```

Copy env (jika belum ada):

```bash
cp .env.example .env
```

Nilai default `.env` (sesuaikan jika perlu):

```env
DATABASE_URL="postgresql://admin:password123@localhost:5432/barbershop_db?schema=public"
PORT=5000
NODE_ENV=development
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"
JWT_EXPIRES_IN="7d"
ALLOWED_ORIGINS="http://localhost:3001,http://localhost:3000"
```

Generate client Prisma + migrate + seed:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Jalankan backend:

```bash
npm run dev
```

Backend berjalan di: `http://localhost:5000`

## 4) Setup frontend

Buka terminal baru:

```bash
cd apps/web
npm install
```

Buat `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Jalankan frontend:

```bash
npm run dev
```

Frontend berjalan di: `http://localhost:3001`

## Akun Seed Default

Data seed ada di `backend/prisma/seed.js`.

Tenant contoh:

- Slug: `the-gentleman-barber`

Akun login:

- Superadmin: `superadmin@barber.com` / `password123`
- Admin barber: `admin@barber.com` / `password123`
- Worker: `barber@barber.com` / `password123`
- Customer: `customer@gmail.com` / `password123`

## URL Akses

- Landing utama: `http://localhost:3001/`
- Tenant public: `http://localhost:3001/the-gentleman-barber`
- Admin/Worker tenant: `http://localhost:3001/the-gentleman-barber/admin`
- Superadmin: `http://localhost:3001/super-admin`

## Script Penting

Di folder `backend`:

- `npm run dev` - jalankan API mode development
- `npm run test` - jalankan unit test
- `npm run test:integration` - jalankan integration test
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - jalankan migration
- `npm run prisma:seed` - isi data seed
- `npm run prisma:studio` - buka Prisma Studio

Di folder `apps/web`:

- `npm run dev` - jalankan Next.js dev server (port 3001)
- `npm run build` - build production
- `npm run start` - run hasil build
- `npm run lint` - linting

## Galeri UI

Simpan screenshot di folder `docs/screenshots/` dengan nama berikut agar tampil otomatis:

- `admin-booking.png`
- `admin-worker.png`
- `admin-layanan.png`
- `admin-jadwal.png`
- `admin-branding.png`
- `tenant-public.png`
- `tenant-worker-layanan.png`
- `landing-fitur.png`
- `landing-harga.png`
- `superadmin-login.png`
- `superadmin-dashboard.png`

Preview di README:

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

## Troubleshooting

- Error `not a git repository`:
  - Pastikan berada di folder repo yang benar: `D:\project\antrian-barbershop\malasngantribarber`
- Error `Cannot find path /mnt/d/...` di PowerShell:
  - Gunakan path Windows: `D:\...`, bukan path WSL `/mnt/d/...`
- Frontend `Failed to fetch`:
  - Pastikan backend hidup di port `5000`
  - Pastikan `.env.local` di `apps/web` sesuai
- Error koneksi database:
  - Pastikan container postgres aktif (`docker ps`)
  - Cek `DATABASE_URL` di `backend/.env`

## Catatan

- Service aktif saat ini adalah `backend` + `apps/web`.
- `apps/api-service` bersifat deprecated.
