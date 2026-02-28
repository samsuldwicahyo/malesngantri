const Joi = require('joi');

const createQueueSchema = Joi.object({
    barbershopId: Joi.string().required(),
    barberId: Joi.string().required(),
    serviceId: Joi.string().required(),
    customerName: Joi.string().min(2).max(100).required(),
    customerPhone: Joi.string().pattern(/^[0-9+]{10,15}$/).required(),
    scheduledDate: Joi.string().isoDate().required(),
    bookingType: Joi.string().valid('ONLINE', 'WALK_IN').default('WALK_IN'),
    scheduledTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
});

const publicCreateQueueSchema = Joi.object({
    barbershopId: Joi.string().required(),
    barberId: Joi.string().required(),
    serviceId: Joi.string().required(),
    customerName: Joi.string().min(2).max(100).required(),
    customerPhone: Joi.string().pattern(/^[0-9+]{10,15}$/).required(),
    scheduledDate: Joi.string().isoDate().required(),
    bookingType: Joi.string().valid('ONLINE', 'WALK_IN').default('ONLINE'),
    scheduledTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
});

const transitionNoteSchema = Joi.object({
    note: Joi.string().max(500).allow('', null)
});

const noShowTransitionSchema = Joi.object({
    note: Joi.string().max(500).allow('', null),
    reason: Joi.string().max(255).allow('', null)
});

const cancelQueueSchema = Joi.object({
    cancelToken: Joi.string().allow('', null),
    cancelReason: Joi.string().max(255).required()
});

const publicCancelQueueSchema = Joi.object({
    cancelToken: Joi.string().required(),
    cancelReason: Joi.string().max(255).required()
});

module.exports = {
    createQueueSchema,
    transitionNoteSchema,
    noShowTransitionSchema,
    cancelQueueSchema,
    publicCreateQueueSchema,
    publicCancelQueueSchema
};
