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
- Landing customer tenant: `/t/:tenantSlug`
- Panel tenant (Admin Barber + Worker): `/t/:tenantSlug/admin`

Catatan implementasi sekarang:
- Contoh halaman tenant ada di `apps/web/src/app/t/[slug]/page.tsx`
- Contoh panel admin tenant ada di `apps/web/src/app/t/[slug]/admin/page.tsx`

## 3. Isolasi Tenant
- Semua tabel operasional menyimpan `tenantId` (atau `barbershopId`) wajib.
- Setiap query API dibatasi oleh `tenantId` dari context route + user session.
- Role `SUPER_ADMIN` boleh lintas tenant.
- Role tenant (`ADMIN_BARBER`, `WORKER`, `CUSTOMER`) hanya tenant miliknya.

## 4. Role & Akses
- `SUPER_ADMIN`: kelola tenant, paket, status langganan
- `ADMIN_BARBER`: kelola profil tenant, worker, layanan, semua booking tenant
- `WORKER`: lihat/update status layanan sesuai booking tenant
- `CUSTOMER`: daftar/login, booking slot, lihat status, cancel

## 5. Status Booking
Gunakan enum final:
- `BOOKED`
- `CHECKED_IN`
- `IN_SERVICE`
- `DONE`
- `CANCELED`
- `NO_SHOW`

Transisi yang direkomendasikan:
- `BOOKED -> CHECKED_IN | CANCELED`
- `CHECKED_IN -> IN_SERVICE | NO_SHOW | CANCELED`
- `IN_SERVICE -> DONE`

## 6. Desain Database (Prisma)
Blueprint schema disimpan di:
- `apps/api-service/prisma/schema.multitenant.prisma`

Entity inti:
- `Tenant`
- `User`
- `Membership` (mapping user ke tenant + role)
- `BarberProfile` (profil worker/pemangkas)
- `Service`
- `Queue` (booking slot)
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
        t/[slug]/page.tsx            # customer tenant landing + booking
        t/[slug]/admin/page.tsx      # admin/worker dashboard booking
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
- Event channel per tenant: `tenant-{slug}-booking`
- Event minimal:
  - `booking.created`
  - `booking.status.updated`
  - `booking.canceled`
- Frontend customer/admin subscribe channel tenant yang sama.
- Di contoh saat ini dipakai `BroadcastChannel` antartab browser untuk demo lokal.

## 9. WhatsApp & Privasi
- Nomor WA customer hanya ditampilkan di panel `/t/:tenantSlug/admin`.
- Tombol WA membuka `wa.me` dengan template pesan (manual send).
- Sistem tidak auto-send agar sesuai requirement privasi + kontrol operator.

## 10. Aturan Langganan
- Tenant hanya aktif jika status subscription `ACTIVE`.
- Jika tidak aktif:
  - halaman admin tenant dikunci,
  - pembuatan booking baru diblok.
