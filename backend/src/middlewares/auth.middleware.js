const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

/**
 * Middleware to verify JWT token
 * Supports both Authorization header and httpOnly cookies
 */
const authenticate = async (req, res, next) => {
    try {
        let token = null;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'No token provided' }
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const subjectUserId = decoded.sub || decoded.userId;

        if (!subjectUserId) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_TOKEN', message: 'Token subject is missing' }
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: subjectUserId },
            include: { barbershop: true, barberInfo: true }
        });

        if (!user || user.deletedAt) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'User not found or account disabled' }
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
        });
    }
};

/**
 * Middleware to check user role (RBAC)
 * @param {string[]} allowedRoles 
 */
const authorize = (...allowedRoles) => {
    const flattenedRoles = allowedRoles.flat().filter(Boolean);

    return (req, res, next) => {
        if (!req.user || !flattenedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
            });
        }
        next();
    };
};

const mapRole = (role) => {
    if (role === 'ADMIN_BARBER') return 'ADMIN';
    if (role === 'WORKER') return 'BARBER';
    return role;
};

const requireAuth = authenticate;

const requireRole = (allowedRoles = []) => {
    const roleList = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const mapped = roleList.map(mapRole);
    return authorize(...mapped);
};

const requireTenantScope = (options = {}) => {
    const { allowSuperAdmin = true } = options;

    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
                });
            }

            if (req.user.role === 'SUPER_ADMIN' && allowSuperAdmin) {
                return next();
            }

            if (!req.user.barbershopId) {
                return res.status(403).json({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'User is not assigned to a tenant' }
                });
            }

            let targetTenantId = req.params.barbershopId || req.body?.barbershopId || req.query?.barbershopId || null;

            if (!targetTenantId && req.params.slug) {
                const shop = await prisma.barbershop.findUnique({
                    where: { slug: req.params.slug },
                    select: { id: true, slug: true }
                });
                if (!shop) {
                    return res.status(404).json({
                        success: false,
                        error: { code: 'TENANT_NOT_FOUND', message: 'Tenant not found' }
                    });
                }
                targetTenantId = shop.id;
                req.tenant = shop;
            }

            if (!targetTenantId) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'TENANT_SCOPE_REQUIRED', message: 'Tenant scope is required' }
                });
            }

            if (req.user.barbershopId !== targetTenantId) {
                return res.status(403).json({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Cross-tenant access is not allowed' }
                });
            }

            req.tenantBarbershopId = targetTenantId;
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    authenticate,
    authorize,
    requireAuth,
    requireRole,
    requireTenantScope,
    // Alias for backward compatibility/flexibility
    verifyToken: authenticate,
    checkRole: authorize
};
