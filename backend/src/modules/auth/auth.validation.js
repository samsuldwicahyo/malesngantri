const Joi = require('joi');

const registerSchema = Joi.object({
    fullName: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().pattern(/^[0-9+]{10,15}$/).required(),
    password: Joi.string().min(8).required(),
    barbershopName: Joi.string().min(2).max(100).required(),
    slug: Joi.string().pattern(/^[a-z0-9-]+$/).required()
});

const customerRegisterSchema = Joi.object({
    fullName: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().pattern(/^[0-9+]{10,15}$/).required(),
    password: Joi.string().min(8).required()
});

const tenantLoginSchema = Joi.object({
    tenantSlug: Joi.string().pattern(/^[a-z0-9-]+$/).required(),
    loginAs: Joi.string().valid('ADMIN', 'WORKER').required(),
    identifier: Joi.string().trim().min(2).required(),
    password: Joi.string().required()
});

const genericLoginSchema = Joi.object({
    email: Joi.string().email(),
    phoneNumber: Joi.string().pattern(/^[0-9+]{10,15}$/),
    identifier: Joi.string().trim().min(2),
    password: Joi.string().required()
}).or('email', 'phoneNumber', 'identifier');

const loginSchema = Joi.alternatives().try(tenantLoginSchema, genericLoginSchema);

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required()
});

module.exports = {
    registerSchema,
    customerRegisterSchema,
    loginSchema,
    refreshTokenSchema
};
