const express = require('express');
const serviceController = require('./service.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { validateBarbershopOwnership } = require('../../middlewares/barbershop.middleware');

const router = express.Router();

router.post(
    '/barbershops/:barbershopId/services',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validateBarbershopOwnership,
    serviceController.createService
);

// Compat: create service without barbershopId
router.post(
    '/services',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    serviceController.createServiceForAdmin
);

router.get(
    '/barbershops/:barbershopId/services',
    serviceController.getServices
);

router.put(
    '/barbershops/:barbershopId/services/:id',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validateBarbershopOwnership,
    serviceController.updateService
);

// Compat: service CRUD by id
router.get(
    '/services/:id',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    serviceController.getServiceById
);

router.put(
    '/services/:id',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    serviceController.updateServiceById
);

router.delete(
    '/services/:id',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    serviceController.deleteServiceById
);

module.exports = router;
