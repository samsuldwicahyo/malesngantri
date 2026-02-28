const express = require('express');
const rateLimit = require('express-rate-limit');
const queueController = require('./queue.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { requireTenantOwnership } = require('../../middlewares/barbershop.middleware');
const { requireActiveSubscription } = require('../../middlewares/subscription.middleware');
const validate = require('../../middlewares/validate.middleware');
const {
    createQueueSchema,
    publicCreateQueueSchema,
    transitionNoteSchema,
    noShowTransitionSchema,
    cancelQueueSchema,
    publicCancelQueueSchema
} = require('./queue.validation');

const router = express.Router();

const cancelLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // restrict to 5 attempts per 15 mins
    message: { success: false, error: { message: 'Terlalu banyak permintaan pembatalan. Silakan coba lagi nanti.' } }
});

// --- Public (Guest) Routes ---
router.post(
    '/public',
    validate(publicCreateQueueSchema),
    requireActiveSubscription({ resolutionOrder: ['body.barbershopId'] }),
    queueController.createPublicQueue
);
router.get('/public/:id', queueController.getPublicQueue);
router.post(
    '/public/:id/cancel',
    cancelLimiter,
    validate(publicCancelQueueSchema),
    queueController.cancelPublicQueue
);

// --- Customer & Shared Routes ---
router.post(
    '/',
    authenticate,
    authorize('CUSTOMER', 'BARBER', 'ADMIN'),
    validate(createQueueSchema),
    requireActiveSubscription(),
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
    authorize('BARBER', 'ADMIN'),
    requireTenantOwnership({ model: 'barber', idParam: 'barberId' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    queueController.getBarberQueues
);

router.patch(
    '/:id/check-in',
    authenticate,
    authorize('BARBER', 'ADMIN'),
    requireTenantOwnership({ model: 'queue', idParam: 'id' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    validate(transitionNoteSchema),
    queueController.checkInQueue
);

router.patch(
    '/:id/start',
    authenticate,
    authorize('BARBER', 'ADMIN'),
    requireTenantOwnership({ model: 'queue', idParam: 'id' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    validate(transitionNoteSchema),
    queueController.startService
);

router.patch(
    '/:id/complete',
    authenticate,
    authorize('BARBER', 'ADMIN'),
    requireTenantOwnership({ model: 'queue', idParam: 'id' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    validate(transitionNoteSchema),
    queueController.completeService
);

router.patch(
    '/:id/no-show',
    authenticate,
    authorize('BARBER', 'ADMIN'),
    requireTenantOwnership({ model: 'queue', idParam: 'id' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    validate(noShowTransitionSchema),
    queueController.markNoShow
);

/**
 * Cancel queue (DELETE /:id)
 *
 * Security:
 * - CUSTOMER: bypasses tenant ownership check (service layer verifies via assertQueueAccess)
 *   but subscription is still enforced at controller level.
 * - BARBER / ADMIN: must belong to the tenant that owns the queue (tenant isolation).
 *   Subscription is enforced by middleware before reaching controller.
 *
 * The inline subscription check that already exists inside cancelQueue() controller
 * provides defence-in-depth even for CUSTOMER path.
 */
router.delete(
    '/:id',
    authenticate,
    authorize('CUSTOMER', 'BARBER', 'ADMIN'),
    // Tenant ownership check: skip for CUSTOMER (they don't carry barbershopId);
    // BARBER / ADMIN must own the queue's tenant.
    (req, res, next) => {
        if (req.user.role === 'CUSTOMER') {
            return next();
        }
        return requireTenantOwnership({ model: 'queue', idParam: 'id' })(req, res, next);
    },
    // Subscription check: for CUSTOMER we fall through to controller's inline check;
    // for BARBER / ADMIN requireTenantOwnership already set req.tenantBarbershopId.
    (req, res, next) => {
        if (req.user.role === 'CUSTOMER') {
            return next();
        }
        return requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] })(req, res, next);
    },
    queueController.cancelQueue
);

module.exports = router;
