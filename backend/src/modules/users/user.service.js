const prisma = require('../../config/database');

/**
 * Get all users with filters and pagination
 */
const getAllUsers = async (filters) => {
    const { page, limit, role, search } = filters;
    const skip = (page - 1) * limit;

    const where = {
        deletedAt: null,
        ...(role && { role }),
        ...(search && {
            OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search, mode: 'insensitive' } },
            ]
        })
    };

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                role: true,
                createdAt: true,
                barbershop: {
                    select: { name: true, slug: true }
                }
            }
        }),
        prisma.user.count({ where })
    ]);

    return {
        users,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get user by ID
 */
const getUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id, deletedAt: null },
        include: {
            barbershop: true,
            barberInfo: true
        }
    });
};

/**
 * Update user
 */
const updateUser = async (id, data) => {
    return await prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            phoneVerified: true,
            phoneVerifiedAt: true
        }
    });
};

/**
 * Soft delete user
 */
const deleteUser = async (id) => {
    return await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
