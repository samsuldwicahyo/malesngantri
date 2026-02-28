const express = require('express');
const userController = require('./user.controller');
const { verifyToken, checkRole } = require('../../middlewares/auth.middleware');
const { requireTenantOwnership } = require('../../middlewares/barbershop.middleware');

const router = express.Router();

// All user routes require authentication
router.use(verifyToken);

// Self route
router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.patch('/me/password', userController.changePassword);

// Admin only routes
router.get('/', checkRole('SUPER_ADMIN', 'ADMIN'), userController.getAllUsers);
router.get(
    '/:id',
    checkRole('SUPER_ADMIN', 'ADMIN'),
    requireTenantOwnership({ model: 'user', idParam: 'id' }),
    userController.getUserById
);
router.put(
    '/:id',
    checkRole('SUPER_ADMIN', 'ADMIN'),
    requireTenantOwnership({ model: 'user', idParam: 'id' }),
    userController.updateUser
);
router.delete(
    '/:id',
    checkRole('SUPER_ADMIN', 'ADMIN'),
    requireTenantOwnership({ model: 'user', idParam: 'id' }),
    userController.deleteUser
);

module.exports = router;
