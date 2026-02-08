const bcrypt = require('bcryptjs');
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
        name, phone, email, nickname, bio, specializations,
        experienceYears, commissionType, commissionValue, commissionBase,
        services, schedule
    } = data;

    // Generate credentials
    const username = generateUsername(name);
    const password = Math.random().toString(36).slice(-8); // 8 char random password
    const passwordHash = await authService.hashPassword(password);

    // Execute in transaction
    const result = await prisma.$transaction(async (tx) => {
        // 1. Create User
        const user = await tx.user.create({
            data: {
                fullName: name,
                email: email || `${username}@malasngantri.com`, // Fallback email
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
                bio,
                specializations,
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

        return { barber, username, password };
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
        // Update basic info
        const barber = await tx.barber.update({
            where: { id: barberId },
            data: barberData
        });

        // Update services if provided
        if (services) {
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
        const barber = await tx.barber.update({
            where: { id: barberId },
            data: {
                deletedAt: new Date(),
                isActive: false,
                status: 'OFFLINE'
            }
        });

        // Deactivate associated user
        await tx.user.update({
            where: { id: barber.userId },
            data: { deletedAt: new Date() }
        });

        return barber;
    });
};

/**
 * Update barber schedule
 */
const updateBarberSchedule = async (barberId, barbershopId, schedules) => {
    return await prisma.$transaction(async (tx) => {
        // Delete old
        await tx.barberSchedule.deleteMany({ where: { barberId } });

        // Create new
        return await tx.barberSchedule.createMany({
            data: schedules.map(s => ({
                barberId,
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
