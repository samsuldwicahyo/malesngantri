const express = require('express');
const queueController = require('./queue.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// --- Public (Guest) Routes ---
router.post('/public', queueController.createPublicQueue);
router.get('/public/:id', queueController.getPublicQueue);
router.post('/public/:id/cancel', queueController.cancelPublicQueue);

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

router.get(
    '/history',
    authenticate,
    authorize('CUSTOMER'),
    queueController.getQueueHistory
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
