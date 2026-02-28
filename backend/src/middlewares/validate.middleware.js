const Joi = require('joi');

/**
 * Middleware to validate request body against a Joi schema
 * @param {Joi.Schema} schema - The Joi schema to validate against
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            errors: {
                wrap: {
                    label: ''
                }
            }
        });

        if (error) {
            const details = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                error: {
                    type: 'VALIDATION_ERROR',
                    message: 'Validation failed',
                    details
                }
            });
        }

        // Replace req.body with validated and stripped value
        req.body = value;
        next();
    };
};

module.exports = validate;
