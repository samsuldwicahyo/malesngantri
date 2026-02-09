const Joi = require('joi');

const scheduleItemSchema = Joi.object({
    dayOfWeek: Joi.number().integer().min(0).max(6).required(),
    startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
    endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
    isWorkDay: Joi.boolean().default(true)
});

const createBarberSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    nickname: Joi.string().trim().max(50),
    phone: Joi.string().pattern(/^[0-9+]{10,15}$/).required(),
    email: Joi.string().email(),
    bio: Joi.string().max(1000),
    specializations: Joi.array().items(Joi.string()),
    experienceYears: Joi.number().integer().min(0).default(0),
    commissionType: Joi.string().valid('PERCENTAGE', 'FIXED', 'COMBINED').required(),
    commissionValue: Joi.number().min(0).required(),
    commissionBase: Joi.number().min(0).when('commissionType', {
        is: 'COMBINED',
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    services: Joi.array().items(Joi.string().uuid()),
    schedule: Joi.array().items(scheduleItemSchema)
});

const updateBarberSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    nickname: Joi.string().trim().max(50),
    phone: Joi.string().pattern(/^[0-9+]{10,15}$/),
    email: Joi.string().email(),
    photoUrl: Joi.string().uri(),
    bio: Joi.string().max(1000),
    specializations: Joi.array().items(Joi.string()),
    experienceYears: Joi.number().integer().min(0),
    commissionType: Joi.string().valid('PERCENTAGE', 'FIXED', 'COMBINED'),
    commissionValue: Joi.number().min(0),
    commissionBase: Joi.number().min(0),
    status: Joi.string().valid('AVAILABLE', 'BUSY', 'ON_BREAK', 'OFFLINE'),
    isActive: Joi.boolean()
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid('AVAILABLE', 'ON_BREAK', 'OFFLINE').required()
});

const updateMyProfileSchema = Joi.object({
    nickname: Joi.string().trim().max(50),
    bio: Joi.string().max(1000),
    photoUrl: Joi.string().uri()
});

module.exports = {
    createBarberSchema,
    updateBarberSchema,
    updateStatusSchema,
    updateMyProfileSchema,
    scheduleItemSchema
};
