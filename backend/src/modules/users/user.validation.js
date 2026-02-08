const Joi = require('joi');

/**
 * User update validation schema
 */
const updateUserSchema = Joi.object({
    fullName: Joi.string().trim().min(3).max(100),
    phoneNumber: Joi.string().pattern(/^[0-9+]{10,15}$/),
    role: Joi.string().valid('SUPER_ADMIN', 'ADMIN', 'BARBER', 'CUSTOMER')
});

/**
 * User pagination/filter validation schema
 */
const getUsersQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    role: Joi.string().valid('SUPER_ADMIN', 'ADMIN', 'BARBER', 'CUSTOMER'),
    search: Joi.string().trim()
});

module.exports = {
    updateUserSchema,
    getUsersQuerySchema
};
