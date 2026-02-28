const Joi = require('joi');

const socialLinksSchema = Joi.object({
    instagram: Joi.string().trim().allow('', null),
    tiktok: Joi.string().trim().allow('', null),
    facebook: Joi.string().trim().allow('', null),
    whatsapp: Joi.string().trim().allow('', null),
    website: Joi.string().trim().allow('', null)
}).optional();

const updateBarbershopSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    address: Joi.string().trim().max(250).allow('', null),
    logoUrl: Joi.string().uri().allow('', null),
    description: Joi.string().trim().max(2000).allow('', null),
    openingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow('', null),
    closingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow('', null),
    timezone: Joi.string().trim().allow('', null),
    socialLinks: socialLinksSchema
}).min(1);

module.exports = {
    updateBarbershopSchema
};
