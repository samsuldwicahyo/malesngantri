const Joi = require('joi');

const createQueueSchema = Joi.object({
    barbershopId: Joi.string().required(),
    barberId: Joi.string().required(),
    customerId: Joi.string().optional(),
    serviceId: Joi.string().required(),
    customerName: Joi.string().trim().min(2).max(100).required(),
    customerPhone: Joi.string().pattern(/^[0-9+]{10,15}$/).optional(),
    bookingType: Joi.string().valid('ONLINE', 'WALK_IN').required(),
    scheduledDate: Joi.date().iso().required(),
    scheduledTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional()
});

const startServiceSchema = Joi.object({
    barberId: Joi.string().required()
});

const completeServiceSchema = Joi.object({
    barberId: Joi.string().required()
});

const cancelQueueSchema = Joi.object({
    cancelReason: Joi.string().max(255).required()
});

module.exports = {
    createQueueSchema,
    startServiceSchema,
    completeServiceSchema,
    cancelQueueSchema
};
