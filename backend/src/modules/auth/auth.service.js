const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../../config/database');

const mapDbRoleToAppRole = (dbRole) => {
    if (dbRole === 'ADMIN') return 'ADMIN_BARBER';
    if (dbRole === 'BARBER') return 'WORKER';
    return dbRole;
};

const mapAppRoleToDbRole = (appRole) => {
    if (appRole === 'ADMIN_BARBER') return 'ADMIN';
    if (appRole === 'WORKER') return 'BARBER';
    return appRole;
};

/**
 * Hash password
 */
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

/**
 * Compare password
 */
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate Access Token with standardized claims
 */
const generateAccessToken = (user) => {
    // user can be the DB user object or a partial object with id, role, barbershopId
    const payload = {
        sub: user.id || user.userId || user.sub,
        role: user.role,
        tenantId: user.barbershopId || user.tenantId || null
    };

    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

/**
 * Create and save Refresh Token to database
 */
const createRefreshToken = async (userId) => {
    const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days

    await prisma.refreshToken.create({
        data: {
            userId,
            token,
            expiresAt
        }
    });

    return token;
};

/**
 * Revoke a specific Refresh Token
 */
const revokeRefreshToken = async (token) => {
    await prisma.refreshToken.updateMany({
        where: { token },
        data: { isRevoked: true }
    });
};

/**
 * Verify and check if Refresh Token is valid (not revoked and exists in DB)
 */
const verifyRefreshToken = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const dbToken = await prisma.refreshToken.findFirst({
            where: {
                token,
                userId: decoded.userId,
                isRevoked: false,
                expiresAt: { gt: new Date() }
            }
        });

        if (!dbToken) return null;
        return decoded;
    } catch (error) {
        return null;
    }
};

module.exports = {
    hashPassword,
    comparePassword,
    mapDbRoleToAppRole,
    mapAppRoleToDbRole,
    generateAccessToken,
    createRefreshToken,
    revokeRefreshToken,
    verifyRefreshToken
};
