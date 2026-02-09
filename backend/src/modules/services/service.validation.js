const Joi = require('joi');

const createServiceSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    price: Joi.number().min(0).required(),
    duration: Joi.number().integer().min(1).required(),
    isActive: Joi.boolean().default(true)
});

const updateServiceSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    description: Joi.string().max(500),
    price: Joi.number().min(0),
    duration: Joi.number().integer().min(1),
    isActive: Joi.boolean()
});

module.exports = {
    createServiceSchema,
    updateServiceSchema
};
