const express = require('express');
const barbershopController = require('./barbershop.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { validateBarbershopOwnership } = require('../../middlewares/barbershop.middleware');

const router = express.Router();

// Public
router.get('/barbershops', barbershopController.listBarbershops);
router.get('/barbershops/slug/:slug', barbershopController.getBarbershopBySlug);
router.get('/barbershops/:id', barbershopController.getBarbershop);
router.get('/barbershops/:id/barbers', barbershopController.listPublicBarbers);
router.patch(
    '/barbershops/:id',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validateBarbershopOwnership,
    barbershopController.updateBarbershop
);

// Admin
router.get(
    '/barbershops/:id/queues',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    barbershopController.listBarbershopQueues
);
router.get(
    '/barbershops/:id/stats',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    barbershopController.getBarbershopStats
);
router.get(
    '/barbershops/:id/customers',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    barbershopController.listBarbershopCustomers
);

module.exports = router;
