const express = require('express');
const scheduleController = require('./schedule.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { requireTenantOwnership } = require('../../middlewares/barbershop.middleware');
const { requireActiveSubscription } = require('../../middlewares/subscription.middleware');

const router = express.Router();

const requireBarberSelfOrAdmin = (req, res, next) => {
    if (req.user?.role !== 'BARBER') {
        return next();
    }

    const myBarberId = req.user?.barberInfo?.id;
    if (!myBarberId || myBarberId !== req.params.barberId) {
        return res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Worker can only access own schedule' }
        });
    }

    return next();
};

// Get full schedule for a barber (can be used by customers too, but here we require auth for admin page sync)
router.get(
    '/barbers/:barberId',
    authenticate,
    authorize('ADMIN', 'BARBER'),
    requireBarberSelfOrAdmin,
    requireTenantOwnership({ model: 'barber', idParam: 'barberId', barbershopIdField: 'barbershopId' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    scheduleController.getBarberSchedule
);

// List unavailable slots for tenant (closed slots)
router.get(
    '/unavailable',
    authenticate,
    authorize('ADMIN'),
    requireActiveSubscription(),
    scheduleController.listUnavailableSlots
);

// Update weekly schedule for a barber
router.put(
    '/weekly/:barberId',
    authenticate,
    authorize('ADMIN'),
    requireTenantOwnership({ model: 'barber', idParam: 'barberId', barbershopIdField: 'barbershopId' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    scheduleController.updateWeeklySchedule
);

// Manage unavailable slots
router.post(
    '/unavailable',
    authenticate,
    authorize('ADMIN'),
    requireActiveSubscription(),
    scheduleController.addUnavailableSlot
);

router.delete(
    '/unavailable/:id',
    authenticate,
    authorize('ADMIN'),
    requireTenantOwnership({ model: 'unavailableSlot', idParam: 'id' }),
    requireActiveSubscription({ resolutionOrder: ['tenantBarbershopId'] }),
    scheduleController.deleteUnavailableSlot
);

module.exports = router;
