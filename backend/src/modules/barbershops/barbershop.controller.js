const prisma = require('../../config/database');

const defaultHours = {
    openingTime: '09:00',
    closingTime: '18:00'
};

const buildBarbershopView = async (shop) => {
    const [reviewAgg, activeQueues, adminUser] = await Promise.all([
        prisma.review.aggregate({
            where: { barbershopId: shop.id },
            _avg: { rating: true },
            _count: { rating: true }
        }),
        prisma.queue.count({
            where: {
                barbershopId: shop.id,
                status: { in: ['WAITING', 'CALLED', 'IN_PROGRESS'] }
            }
        }),
        prisma.user.findFirst({
            where: { barbershopId: shop.id, role: 'ADMIN' },
            select: { phoneNumber: true }
        })
    ]);

    const averageRating = reviewAgg?._avg?.rating || 0;
    const totalReviews = reviewAgg?._count?.rating || 0;

    return {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        address: shop.address,
        logoUrl: shop.logoUrl,
        photoUrl: shop.logoUrl,
        timezone: shop.timezone,
        subscriptionStatus: shop.subscriptionStatus,
        isOpen: true,
        openingTime: defaultHours.openingTime,
        closingTime: defaultHours.closingTime,
        averageRating,
        totalReviews,
        activeQueues,
        phoneNumber: adminUser?.phoneNumber || null,
        latitude: null,
        longitude: null,
        createdAt: shop.createdAt,
        updatedAt: shop.updatedAt
    };
};

const listBarbershops = async (req, res, next) => {
    try {
        const { search, status } = req.query;
        const where = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { address: { contains: search, mode: 'insensitive' } }
                ]
            })
        };

        const shops = await prisma.barbershop.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        const data = await Promise.all(shops.map(buildBarbershopView));

        const filtered = status === 'open'
            ? data.filter((item) => item.isOpen)
            : status === 'closed'
                ? data.filter((item) => !item.isOpen)
                : data;

        res.json({ success: true, data: filtered });
    } catch (err) {
        next(err);
    }
};

const getBarbershopBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const shop = await prisma.barbershop.findUnique({ where: { slug } });
        if (!shop) {
            return res.status(404).json({ success: false, error: { message: 'Barbershop not found' } });
        }

        const data = await buildBarbershopView(shop);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

const getBarbershop = async (req, res, next) => {
    try {
        const { id } = req.params;
        const shop = await prisma.barbershop.findUnique({ where: { id } });
        if (!shop) {
            return res.status(404).json({ success: false, error: { message: 'Barbershop not found' } });
        }

        const data = await buildBarbershopView(shop);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

const listPublicBarbers = async (req, res, next) => {
    try {
        const { id } = req.params;
        const barbers = await prisma.barber.findMany({
            where: { barbershopId: id },
            include: {
                services: {
                    include: { service: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const data = await Promise.all(barbers.map(async (barber) => {
            const activeQueues = await prisma.queue.count({
                where: {
                    barberId: barber.id,
                    status: { in: ['WAITING', 'CALLED', 'IN_PROGRESS'] }
                }
            });
            return {
                id: barber.id,
                name: barber.name,
                nickname: barber.nickname,
                photoUrl: barber.photoUrl,
                bio: barber.bio,
                experienceYears: barber.experienceYears,
                specializations: barber.specializations,
                averageRating: barber.averageRating || 0,
                totalReviews: barber.totalReviews || 0,
                status: barber.status,
                isActive: barber.isActive,
                activeQueues,
                services: barber.services.map((bs) => bs.service)
            };
        }));

        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

const listBarbershopQueues = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date, status } = req.query;
        const dateObj = new Date(date || new Date());
        const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
        const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

        const queues = await prisma.queue.findMany({
            where: {
                barbershopId: id,
                scheduledDate: { gte: startOfDay, lte: endOfDay },
                ...(status && { status })
            },
            include: {
                barber: true,
                service: true,
                customer: { select: { id: true, fullName: true, phoneNumber: true } }
            },
            orderBy: { position: 'asc' }
        });

        res.json({ success: true, data: queues });
    } catch (err) {
        next(err);
    }
};

const getBarbershopStats = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [barbersCount, servicesCount, customersCount, queuesCount] = await Promise.all([
            prisma.barber.count({ where: { barbershopId: id } }),
            prisma.service.count({ where: { barbershopId: id } }),
            prisma.queue.findMany({
                where: { barbershopId: id, customerId: { not: null } },
                select: { customerId: true }
            }),
            prisma.queue.count({ where: { barbershopId: id } })
        ]);

        const uniqueCustomers = new Set(customersCount.map((q) => q.customerId)).size;

        res.json({
            success: true,
            data: {
                barbersCount,
                servicesCount,
                customersCount: uniqueCustomers,
                queuesCount
            }
        });
    } catch (err) {
        next(err);
    }
};

const listBarbershopCustomers = async (req, res, next) => {
    try {
        const { id } = req.params;
        const queues = await prisma.queue.findMany({
            where: { barbershopId: id, customerId: { not: null } },
            include: { customer: true },
            orderBy: { createdAt: 'desc' }
        });

        const byId = new Map();
        for (const queue of queues) {
            if (queue.customer && !byId.has(queue.customerId)) {
                byId.set(queue.customerId, queue.customer);
            }
        }

        res.json({ success: true, data: Array.from(byId.values()) });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    listBarbershops,
    getBarbershopBySlug,
    getBarbershop,
    listPublicBarbers,
    listBarbershopQueues,
    getBarbershopStats,
    listBarbershopCustomers
};
