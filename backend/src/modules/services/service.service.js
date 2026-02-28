const prisma = require('../../config/database');

/**
 * Create a new Service
 */
const createService = async (barbershopId, data) => {
    return await prisma.service.create({
        data: {
            ...data,
            barbershopId
        }
    });
};

/**
 * Get all services for a barbershop
 */
const getServices = async (barbershopId, filters) => {
    const { isActive } = filters;
    return await prisma.service.findMany({
        where: {
            barbershopId,
            ...(isActive !== undefined && { isActive: isActive === 'true' })
        },
        orderBy: { name: 'asc' }
    });
};

/**
 * Get service by ID
 */
const getServiceById = async (id, barbershopId) => {
    return await prisma.service.findFirst({
        where: { id, barbershopId }
    });
};

/**
 * Update service
 */
const updateService = async (id, barbershopId, data) => {
    const result = await prisma.service.updateMany({
        where: { id, barbershopId },
        data
    });

    if (result.count === 0) {
        const err = new Error('Service not found in this tenant');
        err.status = 404;
        throw err;
    }

    return prisma.service.findUnique({ where: { id } });
};

/**
 * Delete service (Hard or Soft delete? The schema doesn't have deletedAt)
 * We'll just set isActive = false or delete if requested.
 */
const deleteService = async (id, barbershopId) => {
    const result = await prisma.service.deleteMany({
        where: { id, barbershopId }
    });

    if (result.count === 0) {
        const err = new Error('Service not found in this tenant');
        err.status = 404;
        throw err;
    }

    return result;
};

module.exports = {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService
};
