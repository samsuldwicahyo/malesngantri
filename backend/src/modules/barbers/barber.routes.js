const express = require('express');
const barberController = require('./barber.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { validateBarbershopOwnership } = require('../../middlewares/barbershop.middleware');

const router = express.Router();

// --- Admin Endpoints ---
// Most admin endpoints are nested under /barbershops/:barbershopId/barbers
router.post(
    '/barbershops/:barbershopId/barbers',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validateBarbershopOwnership,
    barberController.createBarber
);

// Compat: create barber without barbershopId
router.post(
    '/barbers',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    barberController.createBarberForAdmin
);

router.get(
    '/barbershops/:barbershopId/barbers',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validateBarbershopOwnership,
    barberController.getAllBarbers
);

router.get(
    '/barbershops/:barbershopId/barbers/:barberId',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN', 'BARBER'), // Barber can see details of peers in same shop maybe? Or restricted to admin.
    validateBarbershopOwnership,
    barberController.getBarberById
);

router.put(
    '/barbershops/:barbershopId/barbers/:barberId',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validateBarbershopOwnership,
    barberController.updateBarber
);

router.delete(
    '/barbershops/:barbershopId/barbers/:barberId',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validateBarbershopOwnership,
    barberController.deleteBarber
);

// Compat: delete barber without barbershopId
router.delete(
    '/barbers/:barberId',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    barberController.deleteBarberSimple
);

router.put(
    '/barbershops/:barbershopId/barbers/:barberId/schedule',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validateBarbershopOwnership,
    barberController.updateBarberSchedule
);

router.post(
    '/barbershops/:barbershopId/barbers/:barberId/services',
    authenticate,
    authorize('ADMIN', 'SUPER_ADMIN'),
    validateBarbershopOwnership,
    barberController.assignServices
);

// --- Barber Self-Management Endpoints ---
// These are not nested under barbershopId as the barber's ID is tied to their JWT
router.get(
    '/me',
    authenticate,
    authorize('BARBER'),
    barberController.getMyProfile
);

router.patch(
    '/me',
    authenticate,
    authorize('BARBER'),
    barberController.updateMyProfile
);

router.get(
    '/me/schedule',
    authenticate,
    authorize('BARBER'),
    barberController.getMySchedule
);

router.get(
    '/me/stats',
    authenticate,
    authorize('BARBER'),
    barberController.getMyStats
);

router.patch(
    '/me/status',
    authenticate,
    authorize('BARBER'),
    barberController.updateMyStatus
);

// Compat: barber queues and services
router.get(
    '/:barberId/queues',
    authenticate,
    authorize('BARBER', 'ADMIN', 'SUPER_ADMIN'),
    barberController.getBarberQueuesCompat
);

router.get(
    '/:barberId/services',
    authenticate,
    authorize('BARBER', 'ADMIN', 'SUPER_ADMIN'),
    barberController.getBarberServices
);

module.exports = router;
