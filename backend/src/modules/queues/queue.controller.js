const queueService = require('./queue.service');
const {
    createQueueSchema,
    cancelQueueSchema,
    publicCreateQueueSchema,
    publicCancelQueueSchema
} = require('./queue.validation');
const prisma = require('../../config/database');

/**
 * Handle success responses
 */
const sendSuccess = (res, data, message, status = 200) => {
    res.status(status).json({
        success: true,
        message,
        data
    });
};

/**
 * Create a new Queue (Booking or Walk-in)
 */
const createQueue = async (req, res, next) => {
    try {
        const { error, value } = createQueueSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        // If customer, ensure customerId matches their own ID or is provided by barber
        if (req.user.role === 'CUSTOMER') {
            value.customerId = req.user.id;
            value.customerName = req.user.fullName;
        }

        const queue = await queueService.createQueue(value);
        sendSuccess(res, queue, 'Queue created successfully', 201);
    } catch (err) {
        next(err);
    }
};

const normalizePhone = (value) => (value || '').replace(/[^\d+]/g, '');

/**
 * Create a new Queue (Guest/Public)
 */
const createPublicQueue = async (req, res, next) => {
    try {
        const { error, value } = publicCreateQueueSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const scheduledDate = value.scheduledDate ? new Date(value.scheduledDate) : new Date();

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
            scheduledDate
        };

        const queue = await queueService.createQueue(payload);
        sendSuccess(res, queue, 'Queue created successfully', 201);
    } catch (err) {
        next(err);
    }
};

/**
 * Get Queue for Guest (no auth, verify by phone)
 */
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
                status: 'IN_PROGRESS'
            },
            orderBy: { actualStart: 'asc' }
        });

        const aheadCount = await prisma.queue.count({
            where: {
                barberId: queue.barberId,
                scheduledDate: { gte: startOfDay, lte: endOfDay },
                status: { in: ['WAITING', 'CALLED', 'IN_PROGRESS'] },
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

/**
 * Cancel Queue (Guest/Public)
 */
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
        const queue = await prisma.queue.findUnique({ where: { id } });
        if (!queue) {
            return res.status(404).json({ success: false, error: { message: 'Queue not found' } });
        }

        const phone = normalizePhone(value.customerPhone);
        if (queue.customerPhone && normalizePhone(queue.customerPhone) !== phone) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Phone mismatch' } });
        }

        const updated = await queueService.cancelQueue(id, null, value.cancelReason);
        sendSuccess(res, updated, 'Queue cancelled');
    } catch (err) {
        next(err);
    }
};

/**
 * Get current user's active queue
 */
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

/**
 * Get all queues for a barber
 */
const getBarberQueues = async (req, res, next) => {
    try {
        const { barberId } = req.params;
        const { date, status } = req.query;
        const queues = await queueService.getBarberQueues(barberId, date, status);
        sendSuccess(res, { queues }, 'Barber queues fetched');
    } catch (err) {
        next(err);
    }
};

/**
 * Start Service (Barber)
 */
const startService = async (req, res, next) => {
    try {
        const { id } = req.params;
        // For now, assumereq.user.id is the barber. 
        // In a real scenario, we'd verify the queue belongs to them.
        const barber = await prisma.barber.findUnique({ where: { userId: req.user.id } });
        if (!barber && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, error: { message: 'Only barbers can start services' } });
        }

        const queue = await queueService.startService(id, barber.id);
        sendSuccess(res, queue, 'Service started');
    } catch (err) {
        next(err);
    }
};

/**
 * Complete Service (Barber)
 */
const completeService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const barber = await prisma.barber.findUnique({ where: { userId: req.user.id } });
        if (!barber && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, error: { message: 'Only barbers can complete services' } });
        }

        const queue = await queueService.completeService(id, barber.id);
        sendSuccess(res, queue, 'Service completed');
    } catch (err) {
        next(err);
    }
};

/**
 * Cancel Queue
 */
const cancelQueue = async (req, res, next) => {
    try {
        const { error, value } = cancelQueueSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const { id } = req.params;
        const queue = await queueService.cancelQueue(id, req.user.id, value.cancelReason);
        sendSuccess(res, queue, 'Queue cancelled');
    } catch (err) {
        next(err);
    }
};

/**
 * Get customer's queue history
 */
const getQueueHistory = async (req, res, next) => {
    try {
        const history = await prisma.queue.findMany({
            where: {
                customerId: req.user.id,
                status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW', 'SKIPPED'] }
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
    getBarberQueues,
    startService,
    completeService,
    cancelQueue,
    getQueueHistory
};
