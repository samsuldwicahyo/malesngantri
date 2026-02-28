const serviceService = require('./service.service');
const { createServiceSchema, updateServiceSchema } = require('./service.validation');

/**
 * Create Service
 */
const createService = async (req, res, next) => {
    try {
        const { error, value } = createServiceSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const service = await serviceService.createService(req.params.barbershopId, value);
        res.status(201).json({ success: true, data: service });
    } catch (err) {
        next(err);
    }
};

/**
 * Create service using admin's barbershop (compat endpoint: POST /services)
 */
const createServiceForAdmin = async (req, res, next) => {
    try {
        const { error, value } = createServiceSchema.validate(req.body);
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

        const service = await serviceService.createService(barbershopId, value);
        res.status(201).json({ success: true, data: service });
    } catch (err) {
        next(err);
    }
};

/**
 * Get all services
 */
const getServices = async (req, res, next) => {
    try {
        const services = await serviceService.getServices(req.params.barbershopId, req.query);
        res.json({ success: true, data: services });
    } catch (err) {
        next(err);
    }
};

/**
 * Update service
 */
const updateService = async (req, res, next) => {
    try {
        const { error, value } = updateServiceSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const { id, barbershopId } = req.params;
        const service = await serviceService.updateService(id, barbershopId, value);
        res.json({ success: true, data: service });
    } catch (err) {
        next(err);
    }
};

/**
 * Get service by ID (compat endpoint)
 */
const getServiceById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const service = await serviceService.getServiceById(id, req.user.barbershopId);
        if (!service) {
            return res.status(404).json({ success: false, error: { message: 'Service not found' } });
        }
        res.json({ success: true, data: service });
    } catch (err) {
        next(err);
    }
};

/**
 * Update service by ID (compat endpoint)
 */
const updateServiceById = async (req, res, next) => {
    try {
        const { error, value } = updateServiceSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const { id } = req.params;
        const service = await serviceService.updateService(id, req.user.barbershopId, value);
        res.json({ success: true, data: service });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete service by ID (compat endpoint)
 */
const deleteServiceById = async (req, res, next) => {
    try {
        const { id } = req.params;
        await serviceService.deleteService(id, req.user.barbershopId);
        res.json({ success: true, data: { id } });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createService,
    createServiceForAdmin,
    getServices,
    updateService,
    getServiceById,
    updateServiceById,
    deleteServiceById
};
