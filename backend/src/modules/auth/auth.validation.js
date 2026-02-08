const Joi = require('joi');

/**
 * Registration validation schema
 */
const registerSchema = Joi.object({
    fullName: Joi.string().trim().min(3).max(100).required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().pattern(/^[0-9+]{10,15}$/).required(),
    password: Joi.string().min(8).required(),
    barbershopName: Joi.string().trim().min(3).max(100).required(),
    slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9-]+$/).required()
});

/**
 * Login validation schema
 */
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

/**
 * Refresh token validation schema
 */
const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required()
});

module.exports = {
    registerSchema,
    loginSchema,
    refreshTokenSchema
};
