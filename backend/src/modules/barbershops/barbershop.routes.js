const express = require('express');
const barbershopController = require('./barbershop.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { validateBarbershopOwnership, requireTenantOwnership } = require('../../middlewares/barbershop.middleware');
const { requireActiveSubscription } = require('../../middlewares/subscription.middleware');

const router = express.Router();

// Public
router.get('/barbershops', barbershopController.listBarbershops);
router.get('/barbershops/slug/:slug', barbershopController.getBarbershopBySlug);
router.get('/barbershops/:id', barbershopController.getBarbershop);
router.get('/barbershops/:id/barbers', barbershopController.listPublicBarbers);
router.patch(
    '/barbershops/:id',
    authenticate,
    authorize('ADMIN'),
    validateBarbershopOwnership,
    requireActiveSubscription({ resolutionOrder: ['params.id'] }),
    barbershopController.updateBarbershop
);

// Admin
router.get(
    '/barbershops/:id/queues',
    authenticate,
    authorize('ADMIN'),
    requireTenantOwnership({ model: 'barbershop', idParam: 'id', barbershopIdField: 'id' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    barbershopController.listBarbershopQueues
);
router.get(
    '/barbershops/:id/stats',
    authenticate,
    authorize('ADMIN'),
    requireTenantOwnership({ model: 'barbershop', idParam: 'id', barbershopIdField: 'id' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    barbershopController.getBarbershopStats
);
router.get(
    '/barbershops/:id/customers',
    authenticate,
    authorize('ADMIN'),
    requireTenantOwnership({ model: 'barbershop', idParam: 'id', barbershopIdField: 'id' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    barbershopController.listBarbershopCustomers
);

module.exports = router;
