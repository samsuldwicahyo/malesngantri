const prisma = require('../../config/database');
const { updateBarbershopSchema } = require('./barbershop.validation');

const defaultHours = {
    openingTime: '09:00',
    closingTime: '18:00'
};

const buildBarbershopView = async (shop) => {
    const settings = typeof shop.settings === 'object' && shop.settings ? shop.settings : {};
    const socialLinks = typeof settings.socialLinks === 'object' && settings.socialLinks ? settings.socialLinks : {};
    const [reviewAgg, activeQueues, adminUser] = await Promise.all([
        prisma.review.aggregate({
            where: { barbershopId: shop.id },
            _avg: { rating: true },
            _count: { rating: true }
        }),
        prisma.queue.count({
            where: {
                barbershopId: shop.id,
                status: { in: ['BOOKED', 'CHECKED_IN', 'IN_SERVICE'] }
            }
        }),
        prisma.user.findFirst({
            where: { barbershopId: shop.id, role: 'ADMIN' },
            select: { phoneNumber: true }
        })
    ]);

    const averageRating = reviewAgg?._avg?.rating || 0;
    const totalReviews = reviewAgg?._count?.rating || 0;
    const openingTime = settings.openingTime || defaultHours.openingTime;
    const closingTime = settings.closingTime || defaultHours.closingTime;
    const operationalHours = settings.operationalHours || `${openingTime} - ${closingTime}`;
    const logoImageUrl = settings.logoImageUrl || shop.logoUrl || null;
    const whatsapp = settings.whatsapp || socialLinks.whatsapp || adminUser?.phoneNumber || null;

    return {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        city: settings.city || null,
        address: shop.address,
        logoUrl: shop.logoUrl || logoImageUrl,
        logoImageUrl,
        coverImageUrl: settings.coverImageUrl || null,
        photoUrl: logoImageUrl,
        mapsUrl: settings.mapsUrl || null,
        timezone: shop.timezone,
        subscriptionStatus: shop.subscriptionStatus,
        isOpen: true,
        openingTime,
        closingTime,
        operationalHours,
        averageRating,
        totalReviews,
        activeQueues,
        whatsapp,
        phoneNumber: whatsapp,
        description: settings.description || null,
        instagram: settings.instagram || socialLinks.instagram || null,
        tiktok: settings.tiktok || socialLinks.tiktok || null,
        facebook: settings.facebook || socialLinks.facebook || null,
        socialLinks: {
            ...socialLinks,
            ...(whatsapp ? { whatsapp } : {})
        },
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
                    status: { in: ['BOOKED', 'CHECKED_IN', 'IN_SERVICE'] }
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

const updateBarbershop = async (req, res, next) => {
    try {
        const { error, value } = updateBarbershopSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const { id } = req.params;
        const shop = await prisma.barbershop.findUnique({ where: { id } });
        if (!shop) {
            return res.status(404).json({ success: false, error: { message: 'Barbershop not found' } });
        }

        const settings = typeof shop.settings === 'object' && shop.settings ? { ...shop.settings } : {};
        const hasValue = (key) => Object.prototype.hasOwnProperty.call(value, key);

        const applySetting = (key, val) => {
            if (val === undefined) return;
            if (val === null || val === '') {
                delete settings[key];
            } else {
                settings[key] = val;
            }
        };

        const cleanSocialLinks = (links) => {
            if (!links || typeof links !== 'object') return null;
            const cleaned = {};
            Object.entries(links).forEach(([k, v]) => {
                if (v !== null && v !== undefined && String(v).trim() !== '') {
                    cleaned[k] = v;
                }
            });
            return Object.keys(cleaned).length ? cleaned : null;
        };

        const parseOperationalHours = (input) => {
            if (typeof input !== 'string') return null;
            const match = input
                .trim()
                .match(/^([01]\d|2[0-3]):([0-5]\d)\s*-\s*([01]\d|2[0-3]):([0-5]\d)$/);
            if (!match) return null;
            return {
                openingTime: `${match[1]}:${match[2]}`,
                closingTime: `${match[3]}:${match[4]}`
            };
        };

        const derivedHours = hasValue('operationalHours')
            ? parseOperationalHours(value.operationalHours)
            : null;

        applySetting('description', value.description);
        applySetting('city', value.city);
        applySetting('whatsapp', value.whatsapp);
        applySetting('operationalHours', value.operationalHours);
        applySetting('coverImageUrl', value.coverImageUrl);
        applySetting('logoImageUrl', value.logoImageUrl);
        applySetting('mapsUrl', value.mapsUrl);
        applySetting('instagram', value.instagram);
        applySetting('tiktok', value.tiktok);
        applySetting('facebook', value.facebook);
        applySetting('openingTime', hasValue('openingTime') ? value.openingTime : derivedHours?.openingTime);
        applySetting('closingTime', hasValue('closingTime') ? value.closingTime : derivedHours?.closingTime);

        const hasSocialPatch =
            hasValue('socialLinks') ||
            hasValue('instagram') ||
            hasValue('tiktok') ||
            hasValue('facebook') ||
            hasValue('whatsapp');

        if (hasSocialPatch) {
            const baseSocials = typeof settings.socialLinks === 'object' && settings.socialLinks ? settings.socialLinks : {};
            const mergedSocials = {
                ...baseSocials,
                ...(value.socialLinks || {}),
                ...(hasValue('instagram') ? { instagram: value.instagram } : {}),
                ...(hasValue('tiktok') ? { tiktok: value.tiktok } : {}),
                ...(hasValue('facebook') ? { facebook: value.facebook } : {}),
                ...(hasValue('whatsapp') ? { whatsapp: value.whatsapp } : {})
            };

            applySetting('socialLinks', cleanSocialLinks(mergedSocials));
        }

        const data = {};
        if (hasValue('name')) data.name = value.name;
        if (hasValue('address')) data.address = value.address;
        if (hasValue('logoUrl')) data.logoUrl = value.logoUrl || null;
        if (!hasValue('logoUrl') && hasValue('logoImageUrl')) data.logoUrl = value.logoImageUrl || null;
        if (hasValue('timezone')) data.timezone = value.timezone;
        data.settings = settings;

        const updated = await prisma.barbershop.update({
            where: { id },
            data
        });

        const view = await buildBarbershopView(updated);
        res.json({ success: true, data: view, message: 'Barbershop updated' });
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
    listBarbershopCustomers,
    updateBarbershop
};
