const prisma = require('../../config/database');
const authService = require('./auth.service');
const { registerSchema, customerRegisterSchema, loginSchema, refreshTokenSchema } = require('./auth.validation');
const otpService = require('../../services/otp.service');

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

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { phoneNumber }] }
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: { code: 'USER_EXISTS', message: 'User with this email or phone already exists' }
            });
        }

        // Check if slug exists
        const existingShop = await prisma.barbershop.findUnique({ where: { slug } });
        if (existingShop) {
            return res.status(409).json({
                success: false,
                error: { code: 'SLUG_EXISTS', message: 'Barbershop URL slug is already taken' }
            });
        }

        const passwordHash = await authService.hashPassword(password);

        // Create Barbershop and User in a transaction
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

        const accessToken = authService.generateAccessToken(result.user.id, result.user.role);
        const refreshToken = authService.generateRefreshToken(result.user.id);

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
                },
                accessToken,
                refreshToken
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

        const accessToken = authService.generateAccessToken(user.id, user.role);
        const refreshToken = authService.generateRefreshToken(user.id);

        res.status(201).json({
            success: true,
            message: 'Customer registration successful',
            data: {
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role
                },
                accessToken,
                refreshToken
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

        const { email, password } = value;
        const identifier = email.trim();
        const normalizedPhone = identifier.replace(/[^\d+]/g, '');

        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    ...(normalizedPhone ? [{ phoneNumber: normalizedPhone }] : [])
                ]
            },
            include: { barbershop: true }
        });

        if (!user && !identifier.includes('@')) {
            const guessedEmail = `${identifier}@malasngantri.com`;
            user = await prisma.user.findFirst({
                where: { email: guessedEmail },
                include: { barbershop: true }
            });
        }

        if (!user || !(await authService.comparePassword(password, user.passwordHash))) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' }
            });
        }

        const accessToken = authService.generateAccessToken(user.id, user.role);
        const refreshToken = authService.generateRefreshToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                    barbershop: user.barbershop
                },
                accessToken,
                refreshToken
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Request OTP for phone verification (Customer only)
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

        // TODO: integrate WhatsApp provider
        console.log(`[OTP] Phone: ${user.phoneNumber} Code: ${code}`);

        res.json({ success: true, message: 'OTP sent' });
    } catch (err) {
        next(err);
    }
};

/**
 * Verify OTP for phone verification
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

        if (!user.phoneNumber) {
            return res.status(400).json({
                success: false,
                error: { code: 'PHONE_REQUIRED', message: 'Phone number required' }
            });
        }

        const { code } = req.body || {};
        if (!code) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'OTP code required' }
            });
        }

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
 * Refresh Access Token
 */
const refreshToken = async (req, res, next) => {
    try {
        const { error, value } = refreshTokenSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const decoded = authService.verifyRefreshToken(value.refreshToken);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token is invalid or expired' }
            });
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'User no longer exists' }
            });
        }

        const accessToken = authService.generateAccessToken(user.id, user.role);
        const newRefreshToken = authService.generateRefreshToken(user.id); // Rotate refresh token

        res.json({
            success: true,
            data: { accessToken, refreshToken: newRefreshToken }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get current me
 */
const me = async (req, res) => {
    res.json({
        success: true,
        data: {
            user: {
                id: req.user.id,
                fullName: req.user.fullName,
                email: req.user.email,
                phoneNumber: req.user.phoneNumber,
                role: req.user.role,
                barbershop: req.user.barbershop
            }
        }
    });
};

/**
 * Logout
 */
const logout = async (req, res) => {
    // In a real app, you might want to blacklist the token in Redis
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
