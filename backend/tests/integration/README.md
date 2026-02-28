# Integration Test Guide

## Prerequisites
- PostgreSQL harus aktif dan bisa diakses dari `backend/.env` (`DATABASE_URL`).
- Jalankan dari folder `backend`.
- Pastikan schema/migration sudah sinkron dengan DB test.

## Setup Cepat
```bash
cd backend
npm install
npx prisma migrate dev
```

Jika pakai Docker lokal:
```bash
docker compose up -d postgres
```

## Jalankan Suite PR-6
```bash
npm run test -- tests/integration/tenant-isolation.test.js
npm run test -- tests/integration/booking-transition.test.js
npm run test -- tests/integration/subscription-enforcement.test.js
```

Atau sekaligus:
```bash
npm run test -- tests/integration/tenant-isolation.test.js tests/integration/booking-transition.test.js tests/integration/subscription-enforcement.test.js
```

## Catatan
- Test membuat data unik sendiri lalu cleanup otomatis.
- Test memakai `JWT_SECRET` dari env; jika kosong, suite akan fallback ke `test-jwt-secret`.
