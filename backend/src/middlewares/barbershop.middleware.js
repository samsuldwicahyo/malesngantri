const prisma = require('../config/database');

/**
 * Middleware to check if the logged-in admin owns the barbershop in params
 * This ensures multi-tenant data isolation.
 */
const validateBarbershopOwnership = async (req, res, next) => {
    try {
        const { barbershopId } = req.params;
        const { id: userId, role, barbershopId: userBarbershopId } = req.user;

        // SUPER_ADMIN can bypass ownership check (if needed in future)
        if (role === 'SUPER_ADMIN') {
            return next();
        }

        // Check if the user is associated with the requested barbershop
        if (userBarbershopId !== barbershopId) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to manage this barbershop'
                }
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateBarbershopOwnership
};
