const prisma = require('../../config/database');

const mapSuperAdminBarbershop = async (shop) => {
    const adminUser = await prisma.user.findFirst({
        where: { barbershopId: shop.id, role: 'ADMIN' },
        select: { fullName: true, email: true }
    });

    const totalBarbers = await prisma.barber.count({ where: { barbershopId: shop.id } });

    return {
        id: shop.id,
        name: shop.name,
        ownerName: adminUser?.fullName || '-',
        ownerEmail: adminUser?.email || '-',
        city: shop.address || '-',
        subscriptionPlan: 'Basic',
        status: shop.subscriptionStatus || 'ACTIVE',
        monthlyRevenue: 0,
        totalBarbers,
        createdAt: shop.createdAt
    };
};

const listBarbershops = async (req, res, next) => {
    try {
        const { search } = req.query;
        const where = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { address: { contains: search, mode: 'insensitive' } }
                ]
            })
        };

        const barbershops = await prisma.barbershop.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        const mapped = await Promise.all(barbershops.map(mapSuperAdminBarbershop));
        res.json({
            success: true,
            data: {
                barbershops: mapped,
                totalPages: 1,
                totalCount: mapped.length
            }
        });
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
        const data = await mapSuperAdminBarbershop(shop);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

const listRecentBarbershops = async (req, res, next) => {
    try {
        const barbershops = await prisma.barbershop.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        const mapped = await Promise.all(barbershops.map(mapSuperAdminBarbershop));
        res.json({ success: true, data: mapped });
    } catch (err) {
        next(err);
    }
};

const stats = async (req, res, next) => {
    try {
        const [
            totalBarbershops,
            totalUsers,
            totalQueues,
            activeBarbershops,
            suspendedBarbershops,
            totalAdmins,
            totalBarbers,
            totalCustomers
        ] = await Promise.all([
            prisma.barbershop.count(),
            prisma.user.count(),
            prisma.queue.count(),
            prisma.barbershop.count({ where: { subscriptionStatus: 'ACTIVE' } }),
            prisma.barbershop.count({ where: { subscriptionStatus: 'SUSPENDED' } }),
            prisma.user.count({ where: { role: 'ADMIN' } }),
            prisma.user.count({ where: { role: 'BARBER' } }),
            prisma.user.count({ where: { role: 'CUSTOMER' } })
        ]);

        res.json({
            success: true,
            data: {
                totalBarbershops,
                activeBarbershops,
                suspendedBarbershops,
                barbershopGrowth: 0,
                totalRevenue: 0,
                revenueGrowth: 0,
                totalUsers,
                totalAdmins,
                totalBarbers,
                totalCustomers,
                userGrowth: 0,
                totalTransactions: totalQueues,
                transactionGrowth: 0,
                churnRate: 0,
                retentionRate: 0,
                upgradeRate: 0,
                downgradeRate: 0,
                alerts: [],
                topBarbershops: []
            }
        });
    } catch (err) {
        next(err);
    }
};

const health = async (req, res) => {
    res.json({ success: true, data: { status: 'OK' } });
};

const notifications = async (req, res) => {
    res.json({ success: true, data: [] });
};

const activateBarbershop = async (req, res, next) => {
    try {
        const { id } = req.params;
        const shop = await prisma.barbershop.update({
            where: { id },
            data: { subscriptionStatus: 'ACTIVE' }
        });
        res.json({ success: true, data: shop });
    } catch (err) {
        next(err);
    }
};

const suspendBarbershop = async (req, res, next) => {
    try {
        const { id } = req.params;
        const shop = await prisma.barbershop.update({
            where: { id },
            data: { subscriptionStatus: 'SUSPENDED' }
        });
        res.json({ success: true, data: shop });
    } catch (err) {
        next(err);
    }
};

const deleteBarbershop = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.barbershop.delete({ where: { id } });
        res.json({ success: true, data: { id } });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    listBarbershops,
    listRecentBarbershops,
    getBarbershop,
    stats,
    health,
    notifications,
    activateBarbershop,
    suspendBarbershop,
    deleteBarbershop
};
