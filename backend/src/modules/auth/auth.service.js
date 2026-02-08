const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../../config/database');

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
 * Generate Access Token
 */
const generateAccessToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // Short lived
    );
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
};
