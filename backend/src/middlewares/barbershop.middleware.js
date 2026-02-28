const prisma = require('../config/database');

/**
 * Middleware to check if the logged-in admin owns the barbershop in params
 * This ensures multi-tenant data isolation.
 */
const validateBarbershopOwnership = async (req, res, next) => {
    try {
        const barbershopId = req.params.barbershopId || req.params.id;
        const { role, barbershopId: userBarbershopId } = req.user;

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

/**
 * Generic tenant ownership guard.
 * Can validate direct barbershopId in params OR infer barbershopId from resource model by id.
 */
const requireTenantOwnership = (options = {}) => {
    const {
        model = null,
        idParam = 'id',
        barbershopParam = 'barbershopId',
        barbershopIdField = 'barbershopId'
    } = options;

    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
                });
            }

            if (user.role === 'SUPER_ADMIN') {
                return next();
            }

            const userBarbershopId = user.barbershopId;
            if (!userBarbershopId) {
                return res.status(403).json({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'User is not assigned to a tenant' }
                });
            }

            let targetBarbershopId = req.params[barbershopParam] || null;

            if (!targetBarbershopId && model && req.params[idParam]) {
                const resourceId = req.params[idParam];
                const resource = await prisma[model].findUnique({
                    where: { id: resourceId },
                    select: { [barbershopIdField]: true }
                });

                if (!resource) {
                    return res.status(404).json({
                        success: false,
                        error: { code: 'NOT_FOUND', message: `${model} not found` }
                    });
                }

                targetBarbershopId = resource[barbershopIdField];
            }

            if (!targetBarbershopId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'TENANT_CONTEXT_REQUIRED',
                        message: 'Unable to resolve tenant context for this request'
                    }
                });
            }

            if (targetBarbershopId !== userBarbershopId) {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'FORBIDDEN',
                        message: 'You do not have permission to access this tenant resource'
                    }
                });
            }

            req.tenantBarbershopId = targetBarbershopId;
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    validateBarbershopOwnership,
    requireTenantOwnership
};
