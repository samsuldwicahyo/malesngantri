const queueService = require('./queue.service');
const {
    createQueueSchema,
    cancelQueueSchema,
    transitionNoteSchema,
    noShowTransitionSchema,
    publicCreateQueueSchema,
    publicCancelQueueSchema
} = require('./queue.validation');
const prisma = require('../../config/database');
const { QueueStatus } = require('./queue.state');

const sendSuccess = (res, data, message, status = 200) => {
    res.status(status).json({
        success: true,
        message,
        data
    });
};

const normalizePhone = (value) => (value || '').replace(/[^\d+]/g, '');

const buildActorContext = async (req) => {
    const actor = {
        userId: req.user.id,
        role: req.user.role,
        barbershopId: req.user.barbershopId || null,
        barberId: null
    };

    if (req.user.role === 'BARBER') {
        const barber = await prisma.barber.findUnique({
            where: { userId: req.user.id },
            select: { id: true, barbershopId: true }
        });
        if (!barber) {
            const err = new Error('Barber profile not found');
            err.status = 403;
            throw err;
        }
        actor.barberId = barber.id;
        actor.barbershopId = barber.barbershopId;
    }

    return actor;
};

const createQueue = async (req, res, next) => {
    try {
        const { error, value } = createQueueSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const payload = { ...value };

        if (req.user.role === 'CUSTOMER') {
            payload.customerId = req.user.id;
            payload.customerName = req.user.fullName;
            payload.customerPhone = req.user.phoneNumber || payload.customerPhone;
            payload.bookingType = 'ONLINE';
            payload.initialStatus = QueueStatus.BOOKED;
        }

        if (['ADMIN', 'BARBER'].includes(req.user.role)) {
            if (!req.user.barbershopId || payload.barbershopId !== req.user.barbershopId) {
                return res.status(403).json({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Cannot create booking for another tenant' }
                });
            }

            if (payload.bookingType === 'WALK_IN') {
                payload.initialStatus = QueueStatus.CHECKED_IN;
            } else {
                payload.initialStatus = QueueStatus.BOOKED;
            }
        }

        payload.customerPhone = normalizePhone(payload.customerPhone);
        payload.scheduledDate = new Date(payload.scheduledDate);

        const [barber, service] = await Promise.all([
            prisma.barber.findUnique({ where: { id: payload.barberId } }),
            prisma.service.findUnique({ where: { id: payload.serviceId } })
        ]);

        if (!barber || barber.barbershopId !== payload.barbershopId) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_BARBER', message: 'Barber tidak valid untuk barbershop ini' }
            });
        }

        if (!service || service.barbershopId !== payload.barbershopId) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_SERVICE', message: 'Layanan tidak valid untuk barbershop ini' }
            });
        }

        const queue = await queueService.createQueue(payload);
        sendSuccess(res, queue, 'Queue created successfully', 201);
    } catch (err) {
        next(err);
    }
};

const createPublicQueue = async (req, res, next) => {
    try {
        const { error, value } = publicCreateQueueSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const [barber, service] = await Promise.all([
            prisma.barber.findUnique({ where: { id: value.barberId } }),
            prisma.service.findUnique({ where: { id: value.serviceId } })
        ]);

        if (!barber || barber.barbershopId !== value.barbershopId) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_BARBER', message: 'Barber tidak valid untuk barbershop ini' }
            });
        }

        if (!service || service.barbershopId !== value.barbershopId) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_SERVICE', message: 'Layanan tidak valid untuk barbershop ini' }
            });
        }

        const payload = {
            ...value,
            customerPhone: normalizePhone(value.customerPhone),
            bookingType: value.bookingType || 'ONLINE',
            initialStatus: QueueStatus.BOOKED,
            scheduledDate: value.scheduledDate ? new Date(value.scheduledDate) : new Date()
        };

        const queue = await queueService.createQueue(payload);
        sendSuccess(res, queue, 'Queue created successfully', 201);
    } catch (err) {
        next(err);
    }
};

const getPublicQueue = async (req, res, next) => {
    try {
        const { id } = req.params;
        const phone = normalizePhone(req.query.phone);

        const queue = await prisma.queue.findUnique({
            where: { id },
            include: { service: true, barber: true, barbershop: true }
        });

        if (!queue) {
            return res.status(404).json({ success: false, error: { message: 'Queue not found' } });
        }

        if (queue.customerPhone && !phone) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Phone required' } });
        }

        if (queue.customerPhone && phone && normalizePhone(queue.customerPhone) !== phone) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Phone mismatch' } });
        }

        const dateObj = new Date(queue.scheduledDate);
        const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
        const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

        const activeQueue = await prisma.queue.findFirst({
            where: {
                barberId: queue.barberId,
                scheduledDate: { gte: startOfDay, lte: endOfDay },
                status: QueueStatus.IN_SERVICE
            },
            orderBy: { actualStart: 'asc' }
        });

        const aheadCount = await prisma.queue.count({
            where: {
                barberId: queue.barberId,
                scheduledDate: { gte: startOfDay, lte: endOfDay },
                status: { in: [QueueStatus.BOOKED, QueueStatus.CHECKED_IN, QueueStatus.IN_SERVICE] },
                position: { lt: queue.position }
            }
        });

        const estimatedWaitMinutes = queue.estimatedStart
            ? Math.max(0, Math.round((queue.estimatedStart.getTime() - Date.now()) / 60000))
            : null;

        res.json({
            success: true,
            data: {
                queue,
                activeQueueNumber: activeQueue?.queueNumber || null,
                aheadCount,
                estimatedWaitMinutes
            }
        });
    } catch (err) {
        next(err);
    }
};

const cancelPublicQueue = async (req, res, next) => {
    try {
        const { error, value } = publicCancelQueueSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const { id } = req.params;
        const { cancelToken, cancelReason } = value;

        const queue = await prisma.queue.findUnique({ where: { id } });
        if (!queue) {
            return res.status(404).json({ success: false, error: { message: 'Queue not found' } });
        }

        // 1. Validate Cancel Token
        if (!queue.cancelToken || queue.cancelToken !== cancelToken) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_TOKEN', message: 'Token pembatalan tidak valid' }
            });
        }

        // 2. Check Status (Only allow before IN_SERVICE)
        const restrictedStatuses = [QueueStatus.IN_SERVICE, QueueStatus.DONE, QueueStatus.NO_SHOW, QueueStatus.CANCELED];
        if (restrictedStatuses.includes(queue.status)) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_STATE', message: 'Antrian sudah diproses atau selesai, tidak dapat dibatalkan.' }
            });
        }

        const tenant = await prisma.barbershop.findUnique({
            where: { id: queue.barbershopId },
            select: { subscriptionStatus: true }
        });
        if (!tenant || tenant.subscriptionStatus !== 'ACTIVE') {
            return res.status(403).json({
                success: false,
                error: { code: 'SUBSCRIPTION_INACTIVE', message: 'Tenant subscription inactive' }
            });
        }

        const actor = {
            userId: queue.customerId || null,
            role: queue.customerId ? 'CUSTOMER' : 'SYSTEM',
            barbershopId: queue.barbershopId,
            barberId: null
        };

        const updated = await queueService.cancelQueue(id, actor, cancelReason);
        sendSuccess(res, updated, 'Queue cancelled');
    } catch (err) {
        next(err);
    }
};

const getMyQueue = async (req, res, next) => {
    try {
        const queue = await queueService.getMyQueue(req.user.id);
        if (!queue) {
            return sendSuccess(res, null, 'No active queue found');
        }
        sendSuccess(res, queue, 'Current queue fetched');
    } catch (err) {
        next(err);
    }
};

const getBarberQueues = async (req, res, next) => {
    try {
        const { barberId } = req.params;
        const { date, status } = req.query;

        if (req.user.role === 'BARBER') {
            const me = await prisma.barber.findUnique({
                where: { userId: req.user.id },
                select: { id: true }
            });
            if (!me || me.id !== barberId) {
                return res.status(403).json({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Barber can only view own queue list' }
                });
            }
        }

        const queues = await queueService.getBarberQueues(barberId, date, status);
        sendSuccess(res, { queues }, 'Barber queues fetched');
    } catch (err) {
        next(err);
    }
};

const checkInQueue = async (req, res, next) => {
    try {
        const { error, value } = transitionNoteSchema.validate(req.body || {});
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const actor = await buildActorContext(req);
        const queue = await queueService.checkInQueue(req.params.id, actor, value.note);
        sendSuccess(res, queue, 'Customer checked in');
    } catch (err) {
        next(err);
    }
};

const startService = async (req, res, next) => {
    try {
        const { error, value } = transitionNoteSchema.validate(req.body || {});
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const actor = await buildActorContext(req);
        const queue = await queueService.startService(req.params.id, actor, value.note);
        sendSuccess(res, queue, 'Service started');
    } catch (err) {
        next(err);
    }
};

const completeService = async (req, res, next) => {
    try {
        const { error, value } = transitionNoteSchema.validate(req.body || {});
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const actor = await buildActorContext(req);
        const queue = await queueService.completeService(req.params.id, actor, value.note);
        sendSuccess(res, queue, 'Service completed');
    } catch (err) {
        next(err);
    }
};

const markNoShow = async (req, res, next) => {
    try {
        const { error, value } = noShowTransitionSchema.validate(req.body || {});
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const actor = await buildActorContext(req);
        const queue = await queueService.markNoShow(req.params.id, actor, {
            reason: value.reason,
            note: value.note
        });
        sendSuccess(res, queue, 'Queue marked as no-show');
    } catch (err) {
        next(err);
    }
};

const cancelQueue = async (req, res, next) => {
    try {
        const { error, value } = cancelQueueSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const queue = await prisma.queue.findUnique({
            where: { id: req.params.id },
            select: { id: true, barbershopId: true }
        });
        if (!queue) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Queue not found' }
            });
        }

        const tenant = await prisma.barbershop.findUnique({
            where: { id: queue.barbershopId },
            select: { subscriptionStatus: true }
        });
        if (!tenant || tenant.subscriptionStatus !== 'ACTIVE') {
            return res.status(403).json({
                success: false,
                error: { code: 'SUBSCRIPTION_INACTIVE', message: 'Booking unavailable for this tenant' }
            });
        }

        const actor = await buildActorContext(req);
        const updatedQueue = await queueService.cancelQueue(req.params.id, actor, value.cancelReason);
        sendSuccess(res, updatedQueue, 'Queue cancelled');
    } catch (err) {
        next(err);
    }
};

const getQueueHistory = async (req, res, next) => {
    try {
        const history = await prisma.queue.findMany({
            where: {
                customerId: req.user.id,
                status: { in: [QueueStatus.DONE, QueueStatus.CANCELED, QueueStatus.NO_SHOW] }
            },
            include: {
                barbershop: true,
                barber: true,
                service: true
            },
            orderBy: { updatedAt: 'desc' }
        });

        const data = history.map((item) => ({
            id: item.id,
            status: item.status,
            scheduledDate: item.scheduledDate,
            barbershop: item.barbershop,
            barber: item.barber,
            service: item.service,
            rating: null
        }));

        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createPublicQueue,
    getPublicQueue,
    cancelPublicQueue,
    createQueue,
    getMyQueue,
    getQueueHistory,
    getBarberQueues,
    checkInQueue,
    startService,
    completeService,
    markNoShow,
    cancelQueue
};
