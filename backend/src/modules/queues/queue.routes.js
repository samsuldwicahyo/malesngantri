const express = require('express');
const queueController = require('./queue.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// --- Customer & Shared Routes ---
router.post(
    '/',
    authenticate,
    authorize('CUSTOMER', 'BARBER', 'ADMIN', 'SUPER_ADMIN'),
    queueController.createQueue
);

router.get(
    '/my-queue',
    authenticate,
    authorize('CUSTOMER'),
    queueController.getMyQueue
);

// --- Barber & Admin Routes ---
router.get(
    '/barbers/:barberId',
    authenticate,
    authorize('BARBER', 'ADMIN', 'SUPER_ADMIN'),
    queueController.getBarberQueues
);

router.patch(
    '/:id/start',
    authenticate,
    authorize('BARBER', 'SUPER_ADMIN'),
    queueController.startService
);

router.patch(
    '/:id/complete',
    authenticate,
    authorize('BARBER', 'SUPER_ADMIN'),
    queueController.completeService
);

router.delete(
    '/:id',
    authenticate,
    authorize('CUSTOMER', 'ADMIN', 'SUPER_ADMIN'),
    queueController.cancelQueue
);

module.exports = router;
