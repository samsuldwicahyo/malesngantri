const express = require('express');
const workerController = require('./worker.controller');
const { requireAuth, requireRole, requireTenantScope } = require('../../middlewares/auth.middleware');
const { requireActiveSubscription } = require('../../middlewares/subscription.middleware');

const router = express.Router();

router.get(
    '/:slug/workers',
    requireAuth,
    requireRole(['ADMIN_BARBER']),
    requireTenantScope(),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    workerController.listWorkers
);

router.post(
    '/:slug/workers',
    requireAuth,
    requireRole(['ADMIN_BARBER']),
    requireTenantScope(),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    workerController.createWorker
);

router.patch(
    '/:slug/workers/:workerId',
    requireAuth,
    requireRole(['ADMIN_BARBER']),
    requireTenantScope(),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    workerController.updateWorker
);

router.delete(
    '/:slug/workers/:workerId',
    requireAuth,
    requireRole(['ADMIN_BARBER']),
    requireTenantScope(),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    workerController.deleteWorker
);

module.exports = router;
