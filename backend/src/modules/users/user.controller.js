const userService = require('./user.service');
const { updateUserSchema, getUsersQuerySchema } = require('./user.validation');

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

        const result = await userService.getAllUsers(value);
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

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
