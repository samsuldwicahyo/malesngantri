# Arsitektur Skripsi Malas Ngantri (SaaS Multi-Tenant)

## 1. Tech Stack Rekomendasi
- Frontend + BFF: `Next.js App Router + TypeScript + Tailwind CSS v4`
- Backend API: `NestJS + Prisma + PostgreSQL`
- Auth: `Auth.js/NextAuth` (session) atau JWT via API service
- Realtime: `Pusher` atau `Supabase Realtime`
- Deployment: `Vercel (web)` + `Neon/Supabase Postgres (db)`

## 2. Multi-Tenant Routing
- Platform utama: `malesngantri.com`
- Landing + register tenant: `/`
- Super Admin: `/super-admin`
- Halaman customer tenant: `/:tenantSlug`
- Panel tenant (Admin Barber + Barber): `/:tenantSlug/admin`

Catatan implementasi sekarang:
- Contoh halaman tenant ada di `apps/web/src/app/[slug]/page.tsx`
- Contoh panel admin tenant ada di `apps/web/src/app/[slug]/admin/page.tsx`

## 3. Isolasi Tenant
- Semua tabel operasional menyimpan `tenantId` (atau `barbershopId`) wajib.
- Setiap query API dibatasi oleh `tenantId` dari context route + user session.
- Role `SUPER_ADMIN` boleh lintas tenant.
- Role tenant (`ADMIN_BARBER`, `BARBER`, `CUSTOMER`) hanya tenant miliknya.

## 4. Role & Akses
- `SUPER_ADMIN`: kelola tenant, paket, status langganan
- `ADMIN_BARBER`: kelola profil tenant, barber, layanan, semua antrian tenant
- `BARBER`: lihat/update antrian sesuai tenant
- `CUSTOMER`: daftar/login, ambil antrian, lihat status, cancel

## 5. Status Antrean
Gunakan enum final:
- `WAITING`
- `CALLED`
- `SERVING`
- `DONE`
- `NO_SHOW`
- `CANCELED`

Transisi yang direkomendasikan:
- `WAITING -> CALLED | CANCELED`
- `CALLED -> SERVING | NO_SHOW | CANCELED`
- `SERVING -> DONE`

## 6. Desain Database (Prisma)
Blueprint schema disimpan di:
- `apps/api-service/prisma/schema.multitenant.prisma`

Entity inti:
- `Tenant`
- `User`
- `Membership` (mapping user ke tenant + role)
- `BarberProfile`
- `Service`
- `Queue`
- `QueueStatusHistory`
- `SubscriptionPlan`
- `TenantSubscription`

## 7. Struktur Folder yang Disarankan
```txt
apps/
  web/
    src/
      app/
        page.tsx                     # landing + register tenant
        super-admin/page.tsx         # super admin panel
        [slug]/page.tsx              # customer tenant page
        [slug]/admin/page.tsx        # admin/barber queue dashboard
      features/
        tenant/
          types.ts
          demo-data.ts
          store.ts
  api-service/
    src/
      modules/
        auth/
        tenants/
        users/
        services/
        queues/
        subscriptions/
    prisma/
      schema.prisma
      schema.multitenant.prisma      # blueprint skripsi
docs/
  skripsi-architecture.md
```

## 8. Realtime yang Direkomendasikan
- Event channel per tenant: `tenant-{slug}-queue`
- Event minimal:
  - `queue.created`
  - `queue.status.updated`
  - `queue.canceled`
- Frontend customer/admin subscribe channel tenant yang sama.
- Di contoh saat ini dipakai `BroadcastChannel` antartab browser untuk demo lokal.

## 9. WhatsApp & Privasi
- Nomor WA customer hanya ditampilkan di panel `/:tenantSlug/admin`.
- Tombol WA membuka `wa.me` dengan template pesan (manual send).
- Sistem tidak auto-send agar sesuai requirement privasi + kontrol operator.

## 10. Aturan Langganan
- Tenant hanya aktif jika status subscription `ACTIVE`.
- Jika tidak aktif:
  - halaman admin tenant dikunci,
  - pembuatan antrean baru diblok.
