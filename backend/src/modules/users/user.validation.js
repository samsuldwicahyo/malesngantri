const Joi = require('joi');

/**
 * User update validation schema
 */
const updateUserSchema = Joi.object({
    fullName: Joi.string().trim().min(3).max(100),
    email: Joi.string().email(),
    phoneNumber: Joi.string().pattern(/^[0-9+]{10,15}$/),
    role: Joi.string().valid('SUPER_ADMIN', 'ADMIN', 'BARBER', 'CUSTOMER')
});

const updateMeSchema = Joi.object({
    fullName: Joi.string().trim().min(3).max(100),
    email: Joi.string().email(),
    phoneNumber: Joi.string().pattern(/^[0-9+]{10,15}$/)
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required()
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
    updateMeSchema,
    changePasswordSchema,
    getUsersQuerySchema
};
