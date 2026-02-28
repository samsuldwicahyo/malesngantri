const userService = require('./user.service');
const { updateUserSchema, updateMeSchema, changePasswordSchema, getUsersQuerySchema } = require('./user.validation');
const authService = require('../auth/auth.service');
const prisma = require('../../config/database');

/**
 * Get all users (Admin only)
 */
const getAllUsers = async (req, res, next) => {
    try {
        const { error, value } = getUsersQuerySchema.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const result = await userService.getAllUsers(value, req.user);
        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'User not found' }
            });
        }
        res.json({
            success: true,
            data: { user }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update user
 */
const updateUser = async (req, res, next) => {
    try {
        const { error, value } = updateUserSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const user = await userService.updateUser(req.params.id, value);
        res.json({
            success: true,
            message: 'User updated successfully',
            data: { user }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete user
 */
const deleteUser = async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.id);
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update current user (self)
 */
const updateMe = async (req, res, next) => {
    try {
        const { error, value } = updateMeSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        if (value.email || value.phoneNumber) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        value.email ? { email: value.email } : undefined,
                        value.phoneNumber ? { phoneNumber: value.phoneNumber } : undefined
                    ].filter(Boolean),
                    NOT: { id: req.user.id }
                }
            });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: { code: 'USER_EXISTS', message: 'Email or phone already in use' }
                });
            }
        }

        const updatePayload = { ...value };
        if (value.phoneNumber && value.phoneNumber !== req.user.phoneNumber) {
            updatePayload.phoneVerified = false;
            updatePayload.phoneVerifiedAt = null;
        }

        const updated = await userService.updateUser(req.user.id, updatePayload);
        res.json({
            success: true,
            message: 'Profile updated',
            data: { user: updated }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Change password for current user
 */
const changePassword = async (req, res, next) => {
    try {
        const { error, value } = changePasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'User not found' }
            });
        }

        const match = await authService.comparePassword(value.currentPassword, user.passwordHash);
        if (!match) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Current password incorrect' }
            });
        }

        const passwordHash = await authService.hashPassword(value.newPassword);
        await prisma.user.update({
            where: { id: req.user.id },
            data: { passwordHash }
        });

        res.json({
            success: true,
            message: 'Password updated'
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get current user
 */
const getMe = async (req, res) => {
    res.json({
        success: true,
        data: { user: req.user }
    });
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    updateMe,
    changePassword,
    deleteUser,
    getMe
};
