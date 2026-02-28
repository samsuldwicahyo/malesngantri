const prisma = require('../../config/database');
const authService = require('../auth/auth.service');

/**
 * Generate a slug-like username from name
 */
const generateUsername = (name) => {
    return name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '') + Math.floor(1000 + Math.random() * 9000);
};

/**
 * Create a new Barber
 */
const createBarber = async (barbershopId, data) => {
    const {
        name, username, password, phone, email, nickname, bio, specializations, photoUrl, socialLinks,
        experienceYears, commissionType, commissionValue, commissionBase,
        services, schedule
    } = data;

    // Generate credentials
    const generatedUsername = generateUsername(name);
    const resolvedUsername = (username || generatedUsername).toLowerCase();
    const resolvedPassword = password || Math.random().toString(36).slice(-8); // 8 char random password
    const passwordHash = await authService.hashPassword(resolvedPassword);
    const userEmail = email || `${resolvedUsername}@malasngantri.com`;

    const existingUser = await prisma.user.findFirst({
        where: {
            barbershopId,
            role: 'BARBER',
            OR: [
                { email: userEmail },
                { username: resolvedUsername }
            ]
        },
        select: { id: true }
    });
    if (existingUser) {
        const err = new Error('Email/username already used in this tenant');
        err.status = 409;
        throw err;
    }

    if (services && services.length > 0) {
        const allowedServices = await prisma.service.count({
            where: {
                id: { in: services },
                barbershopId
            }
        });
        if (allowedServices !== services.length) {
            const err = new Error('One or more services do not belong to this tenant');
            err.status = 400;
            throw err;
        }
    }

    // Execute in transaction
    const result = await prisma.$transaction(async (tx) => {
        // 1. Create User
        const user = await tx.user.create({
            data: {
                fullName: name,
                email: userEmail, // Fallback email
                username: resolvedUsername,
                phoneNumber: phone,
                passwordHash,
                role: 'BARBER',
                barbershopId
            }
        });

        // 2. Create Barber
        const barber = await tx.barber.create({
            data: {
                userId: user.id,
                barbershopId,
                name,
                nickname,
                phone,
                email,
                photoUrl: photoUrl || null,
                bio,
                specializations,
                socialLinks: socialLinks || undefined,
                experienceYears,
                commissionType,
                commissionValue,
                commissionBase,
                status: 'AVAILABLE'
            }
        });

        // 3. Create Schedules
        if (schedule && schedule.length > 0) {
            await tx.barberSchedule.createMany({
                data: schedule.map(s => ({
                    barberId: barber.id,
                    dayOfWeek: s.dayOfWeek,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    isWorkDay: s.isWorkDay ?? true
                }))
            });
        }

        // 4. Assign Services
        if (services && services.length > 0) {
            await tx.barberService.createMany({
                data: services.map(serviceId => ({
                    barberId: barber.id,
                    serviceId
                }))
            });
        }

        return { barber, username: resolvedUsername, password: resolvedPassword, email: userEmail };
    });

    return result;
};

/**
 * Get all barbers for a barbershop
 */
const getAllBarbers = async (barbershopId, filters) => {
    const { page = 1, limit = 10, status, search } = filters;
    const skip = (page - 1) * limit;

    const where = {
        barbershopId,
        deletedAt: null,
        ...(status && { status }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { nickname: { contains: search, mode: 'insensitive' } }
            ]
        })
    };

    const [barbers, total] = await Promise.all([
        prisma.barber.findMany({
            where,
            skip,
            take: parseInt(limit),
            include: {
                services: {
                    include: { service: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.barber.count({ where })
    ]);

    return {
        barbers,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get barber by ID
 */
const getBarberById = async (barberId, barbershopId) => {
    return await prisma.barber.findFirst({
        where: {
            id: barberId,
            barbershopId,
            deletedAt: null
        },
        include: {
            services: { include: { service: true } },
            schedules: true,
            user: {
                select: { email: true, phoneNumber: true, role: true }
            }
        }
    });
};

/**
 * Update barber
 */
const updateBarber = async (barberId, barbershopId, data) => {
    const { services, ...barberData } = data;

    return await prisma.$transaction(async (tx) => {
        const existing = await tx.barber.findFirst({
            where: { id: barberId, barbershopId, deletedAt: null },
            select: { id: true }
        });
        if (!existing) {
            const err = new Error('Barber not found in this tenant');
            err.status = 404;
            throw err;
        }

        // Update basic info
        const updateResult = await tx.barber.updateMany({
            where: { id: barberId, barbershopId, deletedAt: null },
            data: barberData
        });
        if (updateResult.count === 0) {
            const err = new Error('Barber not found in this tenant');
            err.status = 404;
            throw err;
        }

        const barber = await tx.barber.findUnique({ where: { id: barberId } });

        // Update services if provided
        if (services) {
            const allowedServices = await tx.service.count({
                where: {
                    id: { in: services },
                    barbershopId
                }
            });
            if (allowedServices !== services.length) {
                const err = new Error('One or more services do not belong to this tenant');
                err.status = 400;
                throw err;
            }

            await tx.barberService.deleteMany({ where: { barberId } });
            if (services.length > 0) {
                await tx.barberService.createMany({
                    data: services.map(serviceId => ({
                        barberId,
                        serviceId
                    }))
                });
            }
        }

        return barber;
    });
};

/**
 * Soft delete barber
 */
const deleteBarber = async (barberId, barbershopId) => {
    // Check for active queues (TODO: Implement when Queue module exists)

    return await prisma.$transaction(async (tx) => {
        const existing = await tx.barber.findFirst({
            where: { id: barberId, barbershopId, deletedAt: null },
            select: { id: true, userId: true }
        });
        if (!existing) {
            const err = new Error('Barber not found in this tenant');
            err.status = 404;
            throw err;
        }

        const updateResult = await tx.barber.updateMany({
            where: { id: existing.id, barbershopId, deletedAt: null },
            data: {
                deletedAt: new Date(),
                isActive: false,
                status: 'OFFLINE'
            }
        });
        if (updateResult.count === 0) {
            const err = new Error('Barber not found in this tenant');
            err.status = 404;
            throw err;
        }

        // Deactivate associated user
        await tx.user.update({
            where: { id: existing.userId },
            data: { deletedAt: new Date() }
        });

        return tx.barber.findUnique({ where: { id: existing.id } });
    });
};

/**
 * Update barber schedule
 */
const updateBarberSchedule = async (barberId, barbershopId, schedules) => {
    return await prisma.$transaction(async (tx) => {
        const existing = await tx.barber.findFirst({
            where: { id: barberId, barbershopId, deletedAt: null },
            select: { id: true }
        });
        if (!existing) {
            const err = new Error('Barber not found in this tenant');
            err.status = 404;
            throw err;
        }

        // Delete old
        await tx.barberSchedule.deleteMany({ where: { barberId: existing.id } });

        // Create new
        return await tx.barberSchedule.createMany({
            data: schedules.map(s => ({
                barberId: existing.id,
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime,
                isWorkDay: s.isWorkDay ?? true
            }))
        });
    });
};

/**
 * Get barber by userId (for self-management)
 */
const getBarberByUserId = async (userId) => {
    return await prisma.barber.findUnique({
        where: { userId, deletedAt: null },
        include: {
            services: { include: { service: true } },
            schedules: true
        }
    });
};

module.exports = {
    createBarber,
    getAllBarbers,
    getBarberById,
    updateBarber,
    deleteBarber,
    updateBarberSchedule,
    getBarberByUserId
};
