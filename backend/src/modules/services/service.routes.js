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

module.exports = router;
