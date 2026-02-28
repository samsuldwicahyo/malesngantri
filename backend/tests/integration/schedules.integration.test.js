process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const app = require('../../src/app');

const prisma = new PrismaClient();

const signToken = (userId) =>
    jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('Schedules integration', () => {
    const unique = `pr5-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fixture = {
        shops: {},
        admins: {},
        barberUsers: {},
        barbers: {},
        tokens: {}
    };

    const createdUserIds = [];
    const createdBarberIds = [];
    const createdShopIds = [];

    const nextPhone = (() => {
        let counter = 100000;
        return () => {
            counter += 1;
            return `+62877${counter}`;
        };
    })();

    beforeAll(async () => {
        await prisma.$connect();

        fixture.shops.a = await prisma.barbershop.create({
            data: {
                name: `Schedule A ${unique}`,
                slug: `schedule-a-${unique}`,
                subscriptionStatus: 'ACTIVE'
            }
        });
        createdShopIds.push(fixture.shops.a.id);

        fixture.shops.b = await prisma.barbershop.create({
            data: {
                name: `Schedule B ${unique}`,
                slug: `schedule-b-${unique}`,
                subscriptionStatus: 'ACTIVE'
            }
        });
        createdShopIds.push(fixture.shops.b.id);

        fixture.shops.expired = await prisma.barbershop.create({
            data: {
                name: `Schedule Expired ${unique}`,
                slug: `schedule-expired-${unique}`,
                subscriptionStatus: 'EXPIRED'
            }
        });
        createdShopIds.push(fixture.shops.expired.id);

        fixture.admins.a = await prisma.user.create({
            data: {
                barbershopId: fixture.shops.a.id,
                username: `admin-a-${unique}`,
                fullName: 'Admin A',
                email: `admin-a-${unique}@example.com`,
                phoneNumber: nextPhone(),
                passwordHash: 'test-hash',
                role: 'ADMIN'
            }
        });
        createdUserIds.push(fixture.admins.a.id);

        fixture.admins.b = await prisma.user.create({
            data: {
                barbershopId: fixture.shops.b.id,
                username: `admin-b-${unique}`,
                fullName: 'Admin B',
                email: `admin-b-${unique}@example.com`,
                phoneNumber: nextPhone(),
                passwordHash: 'test-hash',
                role: 'ADMIN'
            }
        });
        createdUserIds.push(fixture.admins.b.id);

        fixture.admins.expired = await prisma.user.create({
            data: {
                barbershopId: fixture.shops.expired.id,
                username: `admin-expired-${unique}`,
                fullName: 'Admin Expired',
                email: `admin-expired-${unique}@example.com`,
                phoneNumber: nextPhone(),
                passwordHash: 'test-hash',
                role: 'ADMIN'
            }
        });
        createdUserIds.push(fixture.admins.expired.id);

        fixture.barberUsers.a = await prisma.user.create({
            data: {
                barbershopId: fixture.shops.a.id,
                username: `barber-a-${unique}`,
                fullName: 'Barber User A',
                email: `barber-a-${unique}@example.com`,
                phoneNumber: nextPhone(),
                passwordHash: 'test-hash',
                role: 'BARBER'
            }
        });
        createdUserIds.push(fixture.barberUsers.a.id);

        fixture.barberUsers.b = await prisma.user.create({
            data: {
                barbershopId: fixture.shops.b.id,
                username: `barber-b-${unique}`,
                fullName: 'Barber User B',
                email: `barber-b-${unique}@example.com`,
                phoneNumber: nextPhone(),
                passwordHash: 'test-hash',
                role: 'BARBER'
            }
        });
        createdUserIds.push(fixture.barberUsers.b.id);

        fixture.barberUsers.expired = await prisma.user.create({
            data: {
                barbershopId: fixture.shops.expired.id,
                username: `barber-expired-${unique}`,
                fullName: 'Barber User Expired',
                email: `barber-expired-${unique}@example.com`,
                phoneNumber: nextPhone(),
                passwordHash: 'test-hash',
                role: 'BARBER'
            }
        });
        createdUserIds.push(fixture.barberUsers.expired.id);

        fixture.barbers.a = await prisma.barber.create({
            data: {
                userId: fixture.barberUsers.a.id,
                barbershopId: fixture.shops.a.id,
                name: 'Barber A',
                phone: nextPhone(),
                specializations: ['Haircut'],
                commissionType: 'PERCENTAGE',
                commissionValue: 40
            }
        });
        createdBarberIds.push(fixture.barbers.a.id);

        fixture.barbers.b = await prisma.barber.create({
            data: {
                userId: fixture.barberUsers.b.id,
                barbershopId: fixture.shops.b.id,
                name: 'Barber B',
                phone: nextPhone(),
                specializations: ['Haircut'],
                commissionType: 'PERCENTAGE',
                commissionValue: 40
            }
        });
        createdBarberIds.push(fixture.barbers.b.id);

        fixture.barbers.expired = await prisma.barber.create({
            data: {
                userId: fixture.barberUsers.expired.id,
                barbershopId: fixture.shops.expired.id,
                name: 'Barber Expired',
                phone: nextPhone(),
                specializations: ['Haircut'],
                commissionType: 'PERCENTAGE',
                commissionValue: 40
            }
        });
        createdBarberIds.push(fixture.barbers.expired.id);

        fixture.tokens.adminA = signToken(fixture.admins.a.id);
        fixture.tokens.adminExpired = signToken(fixture.admins.expired.id);
    });

    afterAll(async () => {
        if (createdShopIds.length > 0) {
            await prisma.unavailableSlot.deleteMany({
                where: { barbershopId: { in: createdShopIds } }
            });
        }

        if (createdBarberIds.length > 0) {
            await prisma.barberSchedule.deleteMany({
                where: { barberId: { in: createdBarberIds } }
            });
            await prisma.barber.deleteMany({
                where: { id: { in: createdBarberIds } }
            });
        }

        if (createdUserIds.length > 0) {
            await prisma.user.deleteMany({
                where: { id: { in: createdUserIds } }
            });
        }

        if (createdShopIds.length > 0) {
            await prisma.barbershop.deleteMany({
                where: { id: { in: createdShopIds } }
            });
        }

        await prisma.$disconnect();
    });

    it('returns 403 for GET /api/v1/schedules/barbers/:barberId when subscription is expired', async () => {
        const res = await request(app)
            .get(`/api/v1/schedules/barbers/${fixture.barbers.expired.id}`)
            .set('Authorization', `Bearer ${fixture.tokens.adminExpired}`);

        expect(res.statusCode).toBe(403);
        expect(res.body?.error?.code).toBe('SUBSCRIPTION_INACTIVE');
    });

    it('blocks tenant A from reading tenant B schedules', async () => {
        const res = await request(app)
            .get(`/api/v1/schedules/barbers/${fixture.barbers.b.id}`)
            .set('Authorization', `Bearer ${fixture.tokens.adminA}`);

        expect(res.statusCode).toBe(403);
        expect(res.body?.error?.code).toBe('FORBIDDEN');
    });

    it('persists create + delete closed slot', async () => {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        const createRes = await request(app)
            .post('/api/v1/schedules/unavailable')
            .set('Authorization', `Bearer ${fixture.tokens.adminA}`)
            .send({
                barberId: fixture.barbers.a.id,
                date: tomorrow,
                startTime: '10:00',
                endTime: '10:30',
                note: 'Closed for maintenance'
            });

        expect(createRes.statusCode).toBe(201);
        const slotId = createRes.body?.data?.id;
        expect(typeof slotId).toBe('string');

        const rowInDb = await prisma.unavailableSlot.findUnique({
            where: { id: slotId }
        });
        expect(rowInDb).not.toBeNull();

        const listRes = await request(app)
            .get('/api/v1/schedules/unavailable')
            .set('Authorization', `Bearer ${fixture.tokens.adminA}`);

        expect(listRes.statusCode).toBe(200);
        const listed = Array.isArray(listRes.body?.data)
            ? listRes.body.data.find((item) => item.id === slotId)
            : null;
        expect(listed).toBeTruthy();

        const deleteRes = await request(app)
            .delete(`/api/v1/schedules/unavailable/${slotId}`)
            .set('Authorization', `Bearer ${fixture.tokens.adminA}`);

        expect(deleteRes.statusCode).toBe(200);

        const rowAfterDelete = await prisma.unavailableSlot.findUnique({
            where: { id: slotId }
        });
        expect(rowAfterDelete).toBeNull();
    });
});

