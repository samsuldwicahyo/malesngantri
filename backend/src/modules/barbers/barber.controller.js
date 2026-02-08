const barberService = require('./barber.service');
const {
    createBarberSchema,
    updateBarberSchema,
    updateStatusSchema,
    updateMyProfileSchema,
    scheduleItemSchema
} = require('./barber.validation');
const Joi = require('joi');

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
        const updated = await barberService.updateBarber(barber.id, barber.barbershopId, value);

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
    getAllBarbers,
    getBarberById,
    updateBarber,
    deleteBarber,
    updateBarberSchedule,
    assignServices,
    getMyProfile,
    updateMyProfile,
    getMySchedule,
    updateMyStatus
};
