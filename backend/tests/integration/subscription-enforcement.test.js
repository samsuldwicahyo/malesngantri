process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const app = require('../../src/app');

const prisma = new PrismaClient();

const signToken = (userId) =>
    jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('Subscription enforcement integration', () => {
    const unique = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fixture = {
        shops: {},
        admins: {},
        barberUser: null,
        barber: null,
        service: null,
        queue: null,
        tokens: {}
    };

    const created = {
        shopIds: [],
        userIds: [],
        barberId: null,
        serviceId: null,
        queueId: null
    };

    const nextPhone = (() => {
        let counter = 400000;
        return () => {
            counter += 1;
            return `+62877${counter}`;
        };
    })();

    beforeAll(async () => {
        await prisma.$connect();

        fixture.shops.expired = await prisma.barbershop.create({
            data: {
                name: `Expired Shop ${unique}`,
                slug: `expired-shop-${unique}`,
                subscriptionStatus: 'EXPIRED'
            }
        });
        created.shopIds.push(fixture.shops.expired.id);

        fixture.shops.suspended = await prisma.barbershop.create({
            data: {
                name: `Suspended Shop ${unique}`,
                slug: `suspended-shop-${unique}`,
                subscriptionStatus: 'SUSPENDED'
            }
        });
        created.shopIds.push(fixture.shops.suspended.id);

        fixture.admins.expired = await prisma.user.create({
            data: {
                barbershopId: fixture.shops.expired.id,
                username: `admin-expired-${unique}`,
                fullName: 'Expired Admin',
                email: `admin-expired-${unique}@example.com`,
                phoneNumber: nextPhone(),
                passwordHash: 'test-hash',
                role: 'ADMIN'
            }
        });
        created.userIds.push(fixture.admins.expired.id);

        fixture.admins.suspended = await prisma.user.create({
            data: {
                barbershopId: fixture.shops.suspended.id,
                username: `admin-suspended-${unique}`,
                fullName: 'Suspended Admin',
                email: `admin-suspended-${unique}@example.com`,
                phoneNumber: nextPhone(),
                passwordHash: 'test-hash',
                role: 'ADMIN'
            }
        });
        created.userIds.push(fixture.admins.suspended.id);

        fixture.barberUser = await prisma.user.create({
            data: {
                barbershopId: fixture.shops.expired.id,
                username: `barber-expired-${unique}`,
                fullName: 'Expired Barber User',
                email: `barber-expired-${unique}@example.com`,
                phoneNumber: nextPhone(),
                passwordHash: 'test-hash',
                role: 'BARBER'
            }
        });
        created.userIds.push(fixture.barberUser.id);

        fixture.barber = await prisma.barber.create({
            data: {
                userId: fixture.barberUser.id,
                barbershopId: fixture.shops.expired.id,
                name: 'Expired Barber',
                phone: nextPhone(),
                specializations: ['Haircut'],
                commissionType: 'PERCENTAGE',
                commissionValue: 40
            }
        });
        created.barberId = fixture.barber.id;

        fixture.service = await prisma.service.create({
            data: {
                barbershopId: fixture.shops.expired.id,
                name: `Expired Service ${unique}`,
                description: 'Service for expired tenant',
                price: 50000,
                duration: 30,
                isActive: true
            }
        });
        created.serviceId = fixture.service.id;

        const scheduledDate = new Date();
        scheduledDate.setHours(0, 0, 0, 0);

        fixture.queue = await prisma.queue.create({
            data: {
                queueNumber: `SUB-${unique}`,
                barbershopId: fixture.shops.expired.id,
                barberId: fixture.barber.id,
                serviceId: fixture.service.id,
                customerName: 'Subscription Customer',
                customerPhone: null,
                bookingType: 'ONLINE',
                scheduledDate,
                scheduledTime: '14:00',
                position: 1,
                estimatedStart: new Date(),
                estimatedDuration: 30,
                estimatedEnd: new Date(Date.now() + (30 * 60 * 1000)),
                status: 'BOOKED'
            }
        });
        created.queueId = fixture.queue.id;

        fixture.tokens.expiredAdmin = signToken(fixture.admins.expired.id);
        fixture.tokens.suspendedAdmin = signToken(fixture.admins.suspended.id);
    });

    afterAll(async () => {
        if (created.queueId) {
            await prisma.notification.deleteMany({
                where: { queueId: created.queueId }
            });
            await prisma.queueHistory.deleteMany({
                where: { queueId: created.queueId }
            });
            await prisma.queue.deleteMany({
                where: { id: created.queueId }
            });
        }

        if (created.serviceId) {
            await prisma.barberService.deleteMany({
                where: { serviceId: created.serviceId }
            });
            await prisma.service.deleteMany({
                where: { id: created.serviceId }
            });
        }

        if (created.barberId) {
            await prisma.barberSchedule.deleteMany({
                where: { barberId: created.barberId }
            });
            await prisma.unavailableSlot.deleteMany({
                where: { barberId: created.barberId }
            });
            await prisma.barber.deleteMany({
                where: { id: created.barberId }
            });
        }

        if (created.userIds.length > 0) {
            await prisma.user.deleteMany({
                where: { id: { in: created.userIds } }
            });
        }

        if (created.shopIds.length > 0) {
            await prisma.barbershop.deleteMany({
                where: { id: { in: created.shopIds } }
            });
        }

        await prisma.$disconnect();
    });

    it('returns 403 for public booking creation when tenant subscription is EXPIRED', async () => {
        const payload = {
            barbershopId: fixture.shops.expired.id,
            barberId: fixture.barber.id,
            serviceId: fixture.service.id,
            customerName: 'Guest User',
            customerPhone: '+6281234567890',
            bookingType: 'ONLINE',
            scheduledDate: new Date().toISOString(),
            scheduledTime: '15:00'
        };

        const res = await request(app)
            .post('/api/v1/queues/public')
            .send(payload);

        expect(res.statusCode).toBe(403);
        expect(res.body?.error?.code).toBe('SUBSCRIPTION_INACTIVE');
        expect(String(res.body?.error?.message || '')).toContain('EXPIRED');
    });

    it('returns 403 for admin operational endpoint when tenant subscription is SUSPENDED', async () => {
        const res = await request(app)
            .get(`/api/v1/barbershops/${fixture.shops.suspended.id}/queues`)
            .set('Authorization', `Bearer ${fixture.tokens.suspendedAdmin}`);

        expect(res.statusCode).toBe(403);
        expect(res.body?.error?.code).toBe('SUBSCRIPTION_INACTIVE');
        expect(String(res.body?.error?.message || '')).toContain('SUSPENDED');
    });

    it('returns 403 for DELETE /api/v1/queues/:id when ADMIN subscription is EXPIRED', async () => {
        const res = await request(app)
            .delete(`/api/v1/queues/${fixture.queue.id}`)
            .set('Authorization', `Bearer ${fixture.tokens.expiredAdmin}`)
            .send({ cancelReason: 'Cancel by admin on expired tenant' });

        expect(res.statusCode).toBe(403);
        expect(res.body?.error?.code).toBe('SUBSCRIPTION_INACTIVE');

        const queue = await prisma.queue.findUnique({
            where: { id: fixture.queue.id },
            select: { status: true }
        });
        expect(queue?.status).toBe('BOOKED');
    });
});
