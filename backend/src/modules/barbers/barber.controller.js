const barberService = require('./barber.service');
const {
    createBarberSchema,
    updateBarberSchema,
    updateStatusSchema,
    updateMyProfileSchema,
    scheduleItemSchema
} = require('./barber.validation');
const Joi = require('joi');
const prisma = require('../../config/database');

/**
 * Handle success responses consistently
 */
const sendSuccess = (res, data, message, status = 200) => {
    res.status(status).json({
        success: true,
        message,
        data
    });
};

/**
 * Create a new Barber (Admin Only)
 */
const createBarber = async (req, res, next) => {
    try {
        const { error, value } = createBarberSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const { barbershopId } = req.params;
        const result = await barberService.createBarber(barbershopId, value);

        sendSuccess(res, result, 'Barber created successfully', 201);
    } catch (err) {
        next(err);
    }
};

/**
 * Create barber using admin's barbershop (compat endpoint: POST /barbers)
 */
const createBarberForAdmin = async (req, res, next) => {
    try {
        const { error, value } = createBarberSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const barbershopId = req.user.barbershopId;
        if (!barbershopId) {
            return res.status(400).json({
                success: false,
                error: { code: 'BARBERSHOP_REQUIRED', message: 'Barbershop is required for admin' }
            });
        }

        const result = await barberService.createBarber(barbershopId, value);
        sendSuccess(res, result, 'Barber created successfully', 201);
    } catch (err) {
        next(err);
    }
};

/**
 * Get all barbers (Paginated)
 */
const getAllBarbers = async (req, res, next) => {
    try {
        const { barbershopId } = req.params;
        const result = await barberService.getAllBarbers(barbershopId, req.query);
        sendSuccess(res, result, 'Barbers fetched successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Get barber by ID
 */
const getBarberById = async (req, res, next) => {
    try {
        const { barberId, barbershopId } = req.params;
        const barber = await barberService.getBarberById(barberId, barbershopId);

        if (!barber) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Barber not found in this barbershop' }
            });
        }

        sendSuccess(res, { barber }, 'Barber details fetched');
    } catch (err) {
        next(err);
    }
};

/**
 * Update barber
 */
const updateBarber = async (req, res, next) => {
    try {
        const { error, value } = updateBarberSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const { barberId, barbershopId } = req.params;
        const barber = await barberService.updateBarber(barberId, barbershopId, value);

        sendSuccess(res, { barber }, 'Barber updated successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Delete barber
 */
const deleteBarber = async (req, res, next) => {
    try {
        const { barberId, barbershopId } = req.params;
        await barberService.deleteBarber(barberId, barbershopId);
        sendSuccess(res, null, 'Barber deleted successfully (soft delete)');
    } catch (err) {
        next(err);
    }
};

/**
 * Delete barber using admin's barbershop (compat endpoint: DELETE /barbers/:barberId)
 */
const deleteBarberSimple = async (req, res, next) => {
    try {
        const { barberId } = req.params;
        const barbershopId = req.user.barbershopId;
        await barberService.deleteBarber(barberId, barbershopId);
        sendSuccess(res, null, 'Barber deleted successfully (soft delete)');
    } catch (err) {
        next(err);
    }
};

/**
 * Get barber stats (compat endpoint: GET /barbers/me/stats)
 */
const getMyStats = async (req, res, next) => {
    try {
        const barber = await barberService.getBarberByUserId(req.user.id);
        if (!barber) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Barber profile not found' }
            });
        }

        const totalQueues = await prisma.queue.count({ where: { barberId: barber.id } });
        const completedQueues = await prisma.queue.count({
            where: { barberId: barber.id, status: 'COMPLETED' }
        });

        sendSuccess(res, {
            totalQueues,
            completedQueues,
            averageRating: barber.averageRating || 0,
            totalReviews: barber.totalReviews || 0
        }, 'Stats fetched');
    } catch (err) {
        next(err);
    }
};

/**
 * Get barber services (compat endpoint: GET /barbers/:barberId/services)
 */
const getBarberServices = async (req, res, next) => {
    try {
        const { barberId } = req.params;
        const services = await prisma.barberService.findMany({
            where: { barberId },
            include: { service: true }
        });
        sendSuccess(res, services.map((item) => item.service), 'Barber services fetched');
    } catch (err) {
        next(err);
    }
};

/**
 * Get barber queues (compat endpoint: GET /barbers/:barberId/queues)
 */
const getBarberQueuesCompat = async (req, res, next) => {
    try {
        const { barberId } = req.params;
        const { date, status } = req.query;
        const dateObj = new Date(date || new Date());
        const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
        const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

        const queues = await prisma.queue.findMany({
            where: {
                barberId,
                scheduledDate: { gte: startOfDay, lte: endOfDay },
                ...(status && { status })
            },
            include: {
                service: true,
                customer: { select: { fullName: true, phoneNumber: true } }
            },
            orderBy: { position: 'asc' }
        });

        sendSuccess(res, { queues }, 'Barber queues fetched');
    } catch (err) {
        next(err);
    }
};

/**
 * Update barber schedule
 */
const updateBarberSchedule = async (req, res, next) => {
    try {
        const schema = Joi.array().items(scheduleItemSchema);
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const { barberId, barbershopId } = req.params;
        await barberService.updateBarberSchedule(barberId, barbershopId, value);
        sendSuccess(res, null, 'Barber schedule updated successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Assign services
 */
const assignServices = async (req, res, next) => {
    try {
        const { serviceIds } = req.body;
        if (!Array.isArray(serviceIds)) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'serviceIds must be an array' }
            });
        }

        const { barberId, barbershopId } = req.params;
        await barberService.updateBarber(barberId, barbershopId, { services: serviceIds });
        sendSuccess(res, null, 'Services assigned successfully');
    } catch (err) {
        next(err);
    }
};

// --- Barber Self-Management ---

/**
 * Get My Profile
 */
const getMyProfile = async (req, res, next) => {
    try {
        const barber = await barberService.getBarberByUserId(req.user.id);
        if (!barber) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Barber profile not found' }
            });
        }
        sendSuccess(res, { barber }, 'My profile fetched');
    } catch (err) {
        next(err);
    }
};

/**
 * Update My Profile
 */
const updateMyProfile = async (req, res, next) => {
    try {
        const { error, value } = updateMyProfileSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const barber = await barberService.getBarberByUserId(req.user.id);
        if (!barber) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Barber profile not found' }
            });
        }

        if (value.phone && value.phone !== req.user.phoneNumber) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    phoneNumber: value.phone,
                    NOT: { id: req.user.id }
                }
            });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: { code: 'USER_EXISTS', message: 'Phone number already in use' }
                });
            }
        }

        const userUpdates = {};
        if (value.name && value.name !== req.user.fullName) {
            userUpdates.fullName = value.name;
        }
        if (value.phone && value.phone !== req.user.phoneNumber) {
            userUpdates.phoneNumber = value.phone;
            userUpdates.phoneVerified = false;
            userUpdates.phoneVerifiedAt = null;
        }

        const barberUpdates = { ...value };

        const updated = await prisma.$transaction(async (tx) => {
            if (Object.keys(userUpdates).length > 0) {
                await tx.user.update({
                    where: { id: req.user.id },
                    data: userUpdates
                });
            }
            return tx.barber.update({
                where: { id: barber.id },
                data: barberUpdates
            });
        });

        sendSuccess(res, { barber: updated }, 'Profile updated successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Get My Schedule
 */
const getMySchedule = async (req, res, next) => {
    try {
        const barber = await barberService.getBarberByUserId(req.user.id);
        sendSuccess(res, { schedule: barber.schedules }, 'My schedule fetched');
    } catch (err) {
        next(err);
    }
};

/**
 * Update My Status
 */
const updateMyStatus = async (req, res, next) => {
    try {
        const { error, value } = updateStatusSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const barber = await barberService.getBarberByUserId(req.user.id);
        const updated = await barberService.updateBarber(barber.id, barber.barbershopId, { status: value.status });

        sendSuccess(res, { status: updated.status }, 'Status updated successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createBarber,
    createBarberForAdmin,
    getAllBarbers,
    getBarberById,
    updateBarber,
    deleteBarber,
    deleteBarberSimple,
    updateBarberSchedule,
    assignServices,
    getMyProfile,
    updateMyProfile,
    getMySchedule,
    updateMyStatus,
    getMyStats,
    getBarberServices,
    getBarberQueuesCompat
};
