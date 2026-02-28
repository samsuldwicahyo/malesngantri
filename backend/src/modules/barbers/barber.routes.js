const express = require('express');
const barberController = require('./barber.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { validateBarbershopOwnership, requireTenantOwnership } = require('../../middlewares/barbershop.middleware');
const { requireActiveSubscription } = require('../../middlewares/subscription.middleware');

const router = express.Router();

// --- Admin Endpoints ---
// Most admin endpoints are nested under /barbershops/:barbershopId/barbers
router.post(
    '/barbershops/:barbershopId/barbers',
    authenticate,
    authorize('ADMIN'),
    validateBarbershopOwnership,
    requireActiveSubscription(),
    barberController.createBarber
);

// Compat: create barber without barbershopId
router.post(
    '/barbers',
    authenticate,
    authorize('ADMIN'),
    requireActiveSubscription(),
    barberController.createBarberForAdmin
);

router.get(
    '/barbershops/:barbershopId/barbers',
    authenticate,
    authorize('ADMIN'),
    validateBarbershopOwnership,
    requireActiveSubscription(),
    barberController.getAllBarbers
);

router.get(
    '/barbershops/:barbershopId/barbers/:barberId',
    authenticate,
    authorize('ADMIN', 'BARBER'), // Barber can see details of peers in same shop maybe? Or restricted to admin.
    validateBarbershopOwnership,
    requireActiveSubscription(),
    barberController.getBarberById
);

router.put(
    '/barbershops/:barbershopId/barbers/:barberId',
    authenticate,
    authorize('ADMIN'),
    validateBarbershopOwnership,
    requireActiveSubscription(),
    barberController.updateBarber
);

router.delete(
    '/barbershops/:barbershopId/barbers/:barberId',
    authenticate,
    authorize('ADMIN'),
    validateBarbershopOwnership,
    requireActiveSubscription(),
    barberController.deleteBarber
);

// Compat: delete barber without barbershopId
router.delete(
    '/barbers/:barberId',
    authenticate,
    authorize('ADMIN'),
    requireTenantOwnership({ model: 'barber', idParam: 'barberId' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    barberController.deleteBarberSimple
);

router.put(
    '/barbershops/:barbershopId/barbers/:barberId/schedule',
    authenticate,
    authorize('ADMIN'),
    validateBarbershopOwnership,
    requireActiveSubscription(),
    barberController.updateBarberSchedule
);

router.post(
    '/barbershops/:barbershopId/barbers/:barberId/services',
    authenticate,
    authorize('ADMIN'),
    validateBarbershopOwnership,
    requireActiveSubscription(),
    barberController.assignServices
);

// --- Barber Self-Management Endpoints ---
// These are not nested under barbershopId as the barber's ID is tied to their JWT
router.get(
    '/me',
    authenticate,
    authorize('BARBER'),
    requireActiveSubscription(),
    barberController.getMyProfile
);

router.patch(
    '/me',
    authenticate,
    authorize('BARBER'),
    requireActiveSubscription(),
    barberController.updateMyProfile
);

router.get(
    '/me/schedule',
    authenticate,
    authorize('BARBER'),
    requireActiveSubscription(),
    barberController.getMySchedule
);

router.get(
    '/me/stats',
    authenticate,
    authorize('BARBER'),
    requireActiveSubscription(),
    barberController.getMyStats
);

router.patch(
    '/me/status',
    authenticate,
    authorize('BARBER'),
    requireActiveSubscription(),
    barberController.updateMyStatus
);

// Compat: barber queues and services
router.get(
    '/:barberId/queues',
    authenticate,
    authorize('BARBER', 'ADMIN'),
    requireTenantOwnership({ model: 'barber', idParam: 'barberId' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    barberController.getBarberQueuesCompat
);

router.get(
    '/:barberId/services',
    authenticate,
    authorize('BARBER', 'ADMIN'),
    requireTenantOwnership({ model: 'barber', idParam: 'barberId' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    barberController.getBarberServices
);

module.exports = router;
