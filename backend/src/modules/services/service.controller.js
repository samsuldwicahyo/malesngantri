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

module.exports = {
    createService,
    getServices,
    updateService
};
