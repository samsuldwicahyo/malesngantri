const Joi = require('joi');

const socialsSchema = Joi.object({
    instagram: Joi.string().trim().allow('', null),
    tiktok: Joi.string().trim().allow('', null),
    facebook: Joi.string().trim().allow('', null)
}).optional();

const createWorkerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    identifier: Joi.string().trim().min(3),
    email: Joi.string().trim().lowercase().email(),
    username: Joi.string().trim().lowercase().pattern(/^[a-z0-9._-]{3,50}$/),
    password: Joi.string().min(8).required(),
    phone: Joi.string().pattern(/^[0-9+]{10,15}$/).optional(),
    photoUrl: Joi.string().uri().allow('', null),
    socials: socialsSchema,
    bio: Joi.string().max(1000).allow('', null),
    isActive: Joi.boolean().default(true)
}).custom((value, helpers) => {
    if (!value.identifier && !value.email && !value.username) {
        return helpers.message('identifier or email or username is required');
    }
    return value;
});

const updateWorkerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    email: Joi.string().trim().lowercase().email(),
    username: Joi.string().trim().lowercase().pattern(/^[a-z0-9._-]{3,50}$/),
    password: Joi.string().min(8),
    phone: Joi.string().pattern(/^[0-9+]{10,15}$/),
    photoUrl: Joi.string().uri().allow('', null),
    socials: socialsSchema,
    bio: Joi.string().max(1000).allow('', null),
    isActive: Joi.boolean()
});

module.exports = {
    createWorkerSchema,
    updateWorkerSchema
};
