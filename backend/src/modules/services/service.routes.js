const express = require('express');
const serviceController = require('./service.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { validateBarbershopOwnership, requireTenantOwnership } = require('../../middlewares/barbershop.middleware');
const { requireActiveSubscription } = require('../../middlewares/subscription.middleware');

const router = express.Router();

router.post(
    '/barbershops/:barbershopId/services',
    authenticate,
    authorize('ADMIN'),
    validateBarbershopOwnership,
    requireActiveSubscription(),
    serviceController.createService
);

// Compat: create service without barbershopId
router.post(
    '/services',
    authenticate,
    authorize('ADMIN'),
    requireActiveSubscription(),
    serviceController.createServiceForAdmin
);

router.get(
    '/barbershops/:barbershopId/services',
    serviceController.getServices
);

router.put(
    '/barbershops/:barbershopId/services/:id',
    authenticate,
    authorize('ADMIN'),
    validateBarbershopOwnership,
    requireTenantOwnership({ model: 'service', idParam: 'id' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    serviceController.updateService
);

// Compat: service CRUD by id
router.get(
    '/services/:id',
    authenticate,
    authorize('ADMIN'),
    requireTenantOwnership({ model: 'service', idParam: 'id' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    serviceController.getServiceById
);

router.put(
    '/services/:id',
    authenticate,
    authorize('ADMIN'),
    requireTenantOwnership({ model: 'service', idParam: 'id' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    serviceController.updateServiceById
);

router.delete(
    '/services/:id',
    authenticate,
    authorize('ADMIN'),
    requireTenantOwnership({ model: 'service', idParam: 'id' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    serviceController.deleteServiceById
);

module.exports = router;
