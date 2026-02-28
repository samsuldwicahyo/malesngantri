process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const app = require('../../src/app');

const prisma = new PrismaClient();

const signToken = (userId) =>
    jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('Booking transitions integration', () => {
    const unique = `trx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fixture = {
        shop: null,
        admin: null,
        barberUser: null,
        barber: null,
        service: null,
        queues: {},
        token: null
    };

    const created = {
        shopId: null,
        userIds: [],
        barberId: null,
        serviceId: null,
        queueIds: []
    };

    const nextPhone = (() => {
        let counter = 300000;
        return () => {
            counter += 1;
            return `+62866${counter}`;
        };
    })();

    const createQueue = async ({ queueNumber, scheduledTime, status, position }) => {
        const scheduledDate = new Date();
        scheduledDate.setHours(0, 0, 0, 0);
        // Keep date unique per queue so test remains compatible even if DB still has old unique(barberId, scheduledDate).
        scheduledDate.setDate(scheduledDate.getDate() + position);
        const start = new Date(Date.now() + (position * 15 * 60 * 1000));
        const end = new Date(start.getTime() + (30 * 60 * 1000));

        const queue = await prisma.queue.create({
            data: {
                queueNumber,
                barbershopId: fixture.shop.id,
                barberId: fixture.barber.id,
                serviceId: fixture.service.id,
                customerName: `Customer ${queueNumber}`,
                customerPhone: null,
                bookingType: 'ONLINE',
                scheduledDate,
                scheduledTime,
                position,
                estimatedStart: start,
                estimatedDuration: 30,
                estimatedEnd: end,
                status
            }
        });
        created.queueIds.push(queue.id);
        return queue;
    };

    beforeAll(async () => {
        await prisma.$connect();

        fixture.shop = await prisma.barbershop.create({
            data: {
                name: `Transition Shop ${unique}`,
                slug: `transition-shop-${unique}`,
                subscriptionStatus: 'ACTIVE'
            }
        });
        created.shopId = fixture.shop.id;

        fixture.admin = await prisma.user.create({
            data: {
                barbershopId: fixture.shop.id,
                username: `admin-${unique}`,
                fullName: 'Transition Admin',
                email: `admin-${unique}@example.com`,
                phoneNumber: nextPhone(),
                passwordHash: 'test-hash',
                role: 'ADMIN'
            }
        });
        created.userIds.push(fixture.admin.id);

        fixture.barberUser = await prisma.user.create({
            data: {
                barbershopId: fixture.shop.id,
                username: `barber-${unique}`,
                fullName: 'Transition Barber',
                email: `barber-${unique}@example.com`,
                phoneNumber: nextPhone(),
                passwordHash: 'test-hash',
                role: 'BARBER'
            }
        });
        created.userIds.push(fixture.barberUser.id);

        fixture.barber = await prisma.barber.create({
            data: {
                userId: fixture.barberUser.id,
                barbershopId: fixture.shop.id,
                name: 'Transition Barber',
                phone: nextPhone(),
                specializations: ['Haircut'],
                commissionType: 'PERCENTAGE',
                commissionValue: 40
            }
        });
        created.barberId = fixture.barber.id;

        fixture.service = await prisma.service.create({
            data: {
                barbershopId: fixture.shop.id,
                name: `Transition Service ${unique}`,
                description: 'Transition test service',
                price: 45000,
                duration: 30,
                isActive: true
            }
        });
        created.serviceId = fixture.service.id;

        fixture.queues.jump = await createQueue({
            queueNumber: `JMP-${unique}`,
            scheduledTime: '10:00',
            status: 'BOOKED',
            position: 1
        });

        fixture.queues.flow = await createQueue({
            queueNumber: `FLW-${unique}`,
            scheduledTime: '10:30',
            status: 'BOOKED',
            position: 2
        });

        fixture.queues.noShow = await createQueue({
            queueNumber: `NOS-${unique}`,
            scheduledTime: '11:00',
            status: 'BOOKED',
            position: 3
        });

        fixture.token = signToken(fixture.admin.id);
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

        if (created.serviceId) {
            await prisma.barberService.deleteMany({
                where: { serviceId: created.serviceId }
            });
            await prisma.service.delete({
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
            await prisma.barber.delete({
                where: { id: created.barberId }
            });
        }

        if (created.userIds.length > 0) {
            await prisma.user.deleteMany({
                where: { id: { in: created.userIds } }
            });
        }

        if (created.shopId) {
            await prisma.barbershop.delete({
                where: { id: created.shopId }
            });
        }

        await prisma.$disconnect();
    });

    it('rejects invalid jump transition BOOKED -> DONE', async () => {
        const res = await request(app)
            .patch(`/api/v1/queues/${fixture.queues.jump.id}/complete`)
            .set('Authorization', `Bearer ${fixture.token}`)
            .send({});

        expect(res.statusCode).toBe(400);
        expect(String(res.body?.message || '')).toContain('Invalid booking transition');

        const queue = await prisma.queue.findUnique({
            where: { id: fixture.queues.jump.id },
            select: { status: true }
        });
        expect(queue?.status).toBe('BOOKED');
    });

    it('allows BOOKED -> CHECKED_IN -> IN_SERVICE -> DONE sequential transitions', async () => {
        const checkInRes = await request(app)
            .patch(`/api/v1/queues/${fixture.queues.flow.id}/check-in`)
            .set('Authorization', `Bearer ${fixture.token}`)
            .send({});

        const startRes = await request(app)
            .patch(`/api/v1/queues/${fixture.queues.flow.id}/start`)
            .set('Authorization', `Bearer ${fixture.token}`)
            .send({});

        const doneRes = await request(app)
            .patch(`/api/v1/queues/${fixture.queues.flow.id}/complete`)
            .set('Authorization', `Bearer ${fixture.token}`)
            .send({});

        expect(checkInRes.statusCode).toBe(200);
        expect(startRes.statusCode).toBe(200);
        expect(doneRes.statusCode).toBe(200);
        expect(checkInRes.body?.data?.status).toBe('CHECKED_IN');
        expect(startRes.body?.data?.status).toBe('IN_SERVICE');
        expect(doneRes.body?.data?.status).toBe('DONE');

        const queue = await prisma.queue.findUnique({
            where: { id: fixture.queues.flow.id },
            select: { status: true, actualStart: true, actualEnd: true }
        });
        expect(queue?.status).toBe('DONE');
        expect(queue?.actualStart).toBeTruthy();
        expect(queue?.actualEnd).toBeTruthy();

        const historyCount = await prisma.queueHistory.count({
            where: {
                queueId: fixture.queues.flow.id,
                status: { in: ['CHECKED_IN', 'IN_SERVICE', 'DONE'] }
            }
        });
        expect(historyCount).toBe(3);
    });

    it('allows BOOKED -> NO_SHOW and persists reason', async () => {
        const reason = 'Pelanggan tidak hadir';
        const res = await request(app)
            .patch(`/api/v1/queues/${fixture.queues.noShow.id}/no-show`)
            .set('Authorization', `Bearer ${fixture.token}`)
            .send({ reason });

        expect(res.statusCode).toBe(200);
        expect(res.body?.data?.status).toBe('NO_SHOW');

        const queue = await prisma.queue.findUnique({
            where: { id: fixture.queues.noShow.id },
            select: { status: true }
        });
        expect(queue?.status).toBe('NO_SHOW');

        const lastHistory = await prisma.queueHistory.findFirst({
            where: { queueId: fixture.queues.noShow.id },
            orderBy: { timestamp: 'desc' },
            select: { status: true, note: true }
        });
        expect(lastHistory?.status).toBe('NO_SHOW');
        expect(String(lastHistory?.note || '')).toContain('Pelanggan');
    });
});
