const prisma = require('../config/database');

const getPathValue = (obj, path) => {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, segment) => (acc ? acc[segment] : undefined), obj);
};

const defaultResolutionOrder = [
    'tenantBarbershopId',
    'params.barbershopId',
    'user.barbershopId',
    'body.barbershopId',
    'query.barbershopId'
];

const requireActiveSubscription = (options = {}) => {
    const resolutionOrder = options.resolutionOrder || defaultResolutionOrder;

    return async (req, res, next) => {
        try {
            if (req.user?.role === 'SUPER_ADMIN') {
                return next();
            }

            let barbershopId = null;
            for (const path of resolutionOrder) {
                const value = getPathValue(req, path);
                if (value) {
                    barbershopId = value;
                    break;
                }
            }

            if (!barbershopId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'TENANT_CONTEXT_REQUIRED',
                        message: 'Unable to determine tenant for subscription validation'
                    }
                });
            }

            const shop = await prisma.barbershop.findUnique({
                where: { id: barbershopId },
                select: { id: true, subscriptionStatus: true }
            });

            if (!shop) {
                return res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Barbershop not found' }
                });
            }

            if (shop.subscriptionStatus !== 'ACTIVE') {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'SUBSCRIPTION_INACTIVE',
                        message: `Tenant subscription is ${shop.subscriptionStatus}`
                    }
                });
            }

            req.tenantBarbershopId = shop.id;
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    requireActiveSubscription
};
