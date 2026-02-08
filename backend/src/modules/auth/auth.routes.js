const express = require('express');
const authController = require('./auth.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/me', verifyToken, authController.me);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
