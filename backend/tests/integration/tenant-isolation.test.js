process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const app = require('../../src/app');

const prisma = new PrismaClient();

const signToken = (userId) =>
    jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('Tenant isolation integration', () => {
    const unique = `iso-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fixture = {
        shops: {},
        admins: {},
        barberUsers: {},
        barbers: {},
        services: {},
        queues: {},
        tokens: {}
    };

    const created = {
        shopIds: [],
        userIds: [],
        barberIds: [],
        serviceIds: [],
        queueIds: []
    };

    const nextPhone = (() => {
        let counter = 200000;
        return () => {
            counter += 1;
            return `+62855${counter}`;
        };
    })();

    beforeAll(async () => {
        await prisma.$connect();

        fixture.shops.a = await prisma.barbershop.create({
            data: {
                name: `Isolation A ${unique}`,
                slug: `isolation-a-${unique}`,
                subscriptionStatus: 'ACTIVE'
            }
        });
        created.shopIds.push(fixture.shops.a.id);

        fixture.shops.b = await prisma.barbershop.create({
            data: {
                name: `Isolation B ${unique}`,
                slug: `isolation-b-${unique}`,
                subscriptionStatus: 'ACTIVE'
            }
        });
        created.shopIds.push(fixture.shops.b.id);

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
        created.userIds.push(fixture.admins.a.id);

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
        created.userIds.push(fixture.admins.b.id);

        fixture.barberUsers.b = await prisma.user.create({
            data: {
                barbershopId: fixture.shops.b.id,
                username: `barber-b-${unique}`,
                fullName: 'Barber B',
                email: `barber-b-${unique}@example.com`,
                phoneNumber: nextPhone(),
                passwordHash: 'test-hash',
                role: 'BARBER'
            }
        });
        created.userIds.push(fixture.barberUsers.b.id);

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
        created.barberIds.push(fixture.barbers.b.id);

        fixture.services.b = await prisma.service.create({
            data: {
                barbershopId: fixture.shops.b.id,
                name: `Service B ${unique}`,
                description: 'Service owned by tenant B',
                price: 50000,
                duration: 30,
                isActive: true
            }
        });
        created.serviceIds.push(fixture.services.b.id);

        const scheduledDate = new Date();
        scheduledDate.setHours(0, 0, 0, 0);

        fixture.queues.b = await prisma.queue.create({
            data: {
                queueNumber: `ISO-${unique}`,
                barbershopId: fixture.shops.b.id,
                barberId: fixture.barbers.b.id,
                serviceId: fixture.services.b.id,
                customerName: 'Queue Tenant B',
                customerPhone: null,
                bookingType: 'ONLINE',
                scheduledDate,
                scheduledTime: '10:00',
                position: 1,
                estimatedStart: new Date(),
                estimatedDuration: 30,
                estimatedEnd: new Date(Date.now() + (30 * 60 * 1000)),
                status: 'BOOKED'
            }
        });
        created.queueIds.push(fixture.queues.b.id);

        fixture.tokens.adminA = signToken(fixture.admins.a.id);
    });

    afterAll(async () => {
        if (created.queueIds.length > 0) {
            await prisma.notification.deleteMany({
                where: { queueId: { in: created.queueIds } }
            });
            await prisma.queueHistory.deleteMany({
                where: { queueId: { in: created.queueIds } }
            });
            await prisma.queue.deleteMany({
                where: { id: { in: created.queueIds } }
            });
        }

        if (created.serviceIds.length > 0) {
            await prisma.barberService.deleteMany({
                where: { serviceId: { in: created.serviceIds } }
            });
            await prisma.service.deleteMany({
                where: { id: { in: created.serviceIds } }
            });
        }

        if (created.barberIds.length > 0) {
            await prisma.barberSchedule.deleteMany({
                where: { barberId: { in: created.barberIds } }
            });
            await prisma.unavailableSlot.deleteMany({
                where: { barberId: { in: created.barberIds } }
            });
            await prisma.barber.deleteMany({
                where: { id: { in: created.barberIds } }
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

    it('blocks ADMIN tenant A from mutating tenant B service by id', async () => {
        const before = await prisma.service.findUnique({
            where: { id: fixture.services.b.id },
            select: { name: true }
        });

        const res = await request(app)
            .put(`/api/v1/services/${fixture.services.b.id}`)
            .set('Authorization', `Bearer ${fixture.tokens.adminA}`)
            .send({ name: 'Illegal Update' });

        expect(res.statusCode).toBe(403);
        expect(res.body?.error?.code).toBe('FORBIDDEN');

        const after = await prisma.service.findUnique({
            where: { id: fixture.services.b.id },
            select: { name: true }
        });
        expect(after?.name).toBe(before?.name);
    });

    it('blocks ADMIN tenant A from deleting tenant B barber', async () => {
        const res = await request(app)
            .delete(`/api/v1/barbers/${fixture.barbers.b.id}`)
            .set('Authorization', `Bearer ${fixture.tokens.adminA}`);

        expect(res.statusCode).toBe(403);
        expect(res.body?.error?.code).toBe('FORBIDDEN');

        const barber = await prisma.barber.findUnique({
            where: { id: fixture.barbers.b.id },
            select: { deletedAt: true }
        });
        expect(barber?.deletedAt).toBeNull();
    });

    it('blocks ADMIN tenant A from cancelling queue owned by tenant B', async () => {
        const res = await request(app)
            .delete(`/api/v1/queues/${fixture.queues.b.id}`)
            .set('Authorization', `Bearer ${fixture.tokens.adminA}`)
            .send({ cancelReason: 'Illegal cross-tenant cancel' });

        expect(res.statusCode).toBe(403);
        expect(res.body?.error?.code).toBe('FORBIDDEN');

        const queue = await prisma.queue.findUnique({
            where: { id: fixture.queues.b.id },
            select: { status: true }
        });
        expect(queue?.status).toBe('BOOKED');
    });
});
