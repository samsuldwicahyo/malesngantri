const express = require('express');
const authController = require('./auth.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('./auth.validation');

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/register-customer', authController.registerCustomer);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/me', verifyToken, authController.me);
router.post('/logout', verifyToken, authController.logout);
router.post('/otp/request', verifyToken, authController.requestOtp);
router.post('/otp/verify', verifyToken, authController.verifyOtp);

module.exports = router;
