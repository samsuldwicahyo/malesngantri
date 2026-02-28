const prisma = require('../../config/database');
const authService = require('./auth.service');
const { registerSchema, customerRegisterSchema, loginSchema, refreshTokenSchema } = require('./auth.validation');
const otpService = require('../../services/otp.service');

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (for refresh token primarily)
};

const ACCESS_COOKIE_OPTIONS = {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000 // 15 minutes
};

const setTokenCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
};

const clearTokenCookies = (res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
};

/**
 * Register a new Barbershop Owner
 */
const register = async (req, res, next) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const { fullName, email, phoneNumber, password, barbershopName, slug } = value;

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { phoneNumber }] }
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: { code: 'USER_EXISTS', message: 'User with this email or phone already exists' }
            });
        }

        const existingShop = await prisma.barbershop.findUnique({ where: { slug } });
        if (existingShop) {
            return res.status(409).json({
                success: false,
                error: { code: 'SLUG_EXISTS', message: 'Barbershop URL slug is already taken' }
            });
        }

        const passwordHash = await authService.hashPassword(password);

        const result = await prisma.$transaction(async (tx) => {
            const shop = await tx.barbershop.create({
                data: { name: barbershopName, slug }
            });

            const user = await tx.user.create({
                data: {
                    fullName,
                    email,
                    phoneNumber,
                    passwordHash,
                    role: 'ADMIN',
                    barbershopId: shop.id
                }
            });

            return { user, shop };
        });

        const accessToken = authService.generateAccessToken(result.user);
        const refreshToken = await authService.createRefreshToken(result.user.id);

        setTokenCookies(res, accessToken, refreshToken);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: result.user.id,
                    fullName: result.user.fullName,
                    email: result.user.email,
                    role: result.user.role,
                    barbershop: result.shop
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Register a new Customer
 */
const registerCustomer = async (req, res, next) => {
    try {
        const { error, value } = customerRegisterSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const { fullName, email, phoneNumber, password } = value;

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { phoneNumber }] }
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: { code: 'USER_EXISTS', message: 'User with this email or phone already exists' }
            });
        }

        const passwordHash = await authService.hashPassword(password);
        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                phoneNumber,
                passwordHash,
                role: 'CUSTOMER'
            }
        });

        const accessToken = authService.generateAccessToken(user);
        const refreshToken = await authService.createRefreshToken(user.id);

        setTokenCookies(res, accessToken, refreshToken);

        res.status(201).json({
            success: true,
            message: 'Customer registration successful',
            data: {
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const { password } = value;

        const isTenantLogin = Boolean(value.tenantSlug && value.loginAs);
        let user;

        if (isTenantLogin) {
            const { tenantSlug, loginAs, identifier } = value;
            const barbershop = await prisma.barbershop.findUnique({
                where: { slug: tenantSlug },
                select: { id: true, slug: true, name: true }
            });
            if (!barbershop) {
                return res.status(404).json({
                    success: false,
                    error: { code: 'TENANT_NOT_FOUND', message: 'Tenant not found' }
                });
            }

            const dbRole = loginAs === 'ADMIN' ? 'ADMIN' : 'BARBER';
            const normalizedIdentifier = identifier.trim();
            const normalizedIdentifierLower = normalizedIdentifier.toLowerCase();
            const normalizedPhone = normalizedIdentifier.replace(/[^\d+]/g, '');

            user = await prisma.user.findFirst({
                where: {
                    barbershopId: barbershop.id,
                    role: dbRole,
                    deletedAt: null,
                    OR: [
                        { email: normalizedIdentifier },
                        { email: normalizedIdentifierLower },
                        { username: normalizedIdentifierLower },
                        ...(normalizedPhone ? [{ phoneNumber: normalizedPhone }] : [])
                    ]
                },
                include: { barbershop: true, barberInfo: true }
            });
        } else {
            const identifier = (value.identifier || value.email || value.phoneNumber || '').trim();
            if (!identifier) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'Identifier is required' }
                });
            }
            const normalizedPhone = identifier.replace(/[^\d+]/g, '');

            user = await prisma.user.findFirst({
                where: {
                    deletedAt: null,
                    OR: [
                        { email: identifier },
                        { username: identifier },
                        ...(normalizedPhone ? [{ phoneNumber: normalizedPhone }] : [])
                    ]
                },
                include: { barbershop: true, barberInfo: true }
            });

            if (!user && !identifier.includes('@')) {
                const guessedEmail = `${identifier}@malasngantri.com`;
                user = await prisma.user.findFirst({
                    where: { email: guessedEmail, deletedAt: null },
                    include: { barbershop: true, barberInfo: true }
                });
            }
        }

        if (!user || !(await authService.comparePassword(password, user.passwordHash))) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Identifier or password is incorrect' }
            });
        }

        if (user.role === 'BARBER') {
            if (!user.barberInfo || user.barberInfo.deletedAt || !user.barberInfo.isActive) {
                return res.status(403).json({
                    success: false,
                    error: { code: 'WORKER_INACTIVE', message: 'Worker account is inactive' }
                });
            }
        }

        const appRole = authService.mapDbRoleToAppRole(user.role);
        const accessToken = authService.generateAccessToken(user);
        const refreshToken = await authService.createRefreshToken(user.id);

        setTokenCookies(res, accessToken, refreshToken);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    username: user.username,
                    role: appRole,
                    dbRole: user.role,
                    tenantId: user.barbershopId || null,
                    workerId: user.barberInfo?.id || null,
                    barbershop: user.barbershop
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Request OTP for phone verification
 */
const requestOtp = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'CUSTOMER') {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Customer only' }
            });
        }

        if (!user.phoneNumber) {
            return res.status(400).json({
                success: false,
                error: { code: 'PHONE_REQUIRED', message: 'Phone number required' }
            });
        }

        const code = otpService.generateCode();
        otpService.saveOtp(user.phoneNumber, code);
        res.json({ success: true, message: 'OTP sent' });
    } catch (err) {
        next(err);
    }
};

/**
 * Verify OTP
 */
const verifyOtp = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'CUSTOMER') {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Customer only' }
            });
        }

        const { code } = req.body || {};
        const result = otpService.verifyOtp(user.phoneNumber, code);
        if (!result.ok) {
            return res.status(400).json({
                success: false,
                error: { code: result.reason, message: 'OTP invalid or expired' }
            });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { phoneVerified: true, phoneVerifiedAt: new Date() }
        });

        res.json({ success: true, message: 'Phone verified' });
    } catch (err) {
        next(err);
    }
};

/**
 * Refresh Access Token using httpOnly cookie
 */
const refreshToken = async (req, res, next) => {
    try {
        const oldToken = req.cookies.refreshToken;
        if (!oldToken) {
            return res.status(401).json({
                success: false,
                error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token cookie is missing' }
            });
        }

        const decoded = await authService.verifyRefreshToken(oldToken);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token is invalid, expired, or revoked' }
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { barbershop: true }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'User no longer exists' }
            });
        }

        // Revoke old token and create new ones (Rotation)
        await authService.revokeRefreshToken(oldToken);
        const accessToken = authService.generateAccessToken(user);
        const newRefreshToken = await authService.createRefreshToken(user.id);

        setTokenCookies(res, accessToken, newRefreshToken);

        res.json({
            success: true,
            message: 'Token refreshed'
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get current me
 */
const me = async (req, res) => {
    const appRole = authService.mapDbRoleToAppRole(req.user.role);
    res.json({
        success: true,
        data: {
            user: {
                id: req.user.id,
                fullName: req.user.fullName,
                email: req.user.email,
                username: req.user.username,
                phoneNumber: req.user.phoneNumber,
                role: req.user.role,
                appRole,
                dbRole: req.user.role,
                tenantId: req.user.barbershopId || null,
                workerId: req.user.barberInfo?.id || null,
                barbershop: req.user.barbershop
            }
        }
    });
};

/**
 * Logout - Revoke tokens and clear cookies
 */
const logout = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (token) {
        await authService.revokeRefreshToken(token);
    }
    clearTokenCookies(res);
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

module.exports = {
    register,
    registerCustomer,
    login,
    refreshToken,
    me,
    logout,
    requestOtp,
    verifyOtp
};
