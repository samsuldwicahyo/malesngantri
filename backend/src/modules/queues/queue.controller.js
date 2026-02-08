const queueService = require('./queue.service');
const {
    createQueueSchema,
    cancelQueueSchema
} = require('./queue.validation');

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

module.exports = {
    createQueue,
    getMyQueue,
    getBarberQueues,
    startService,
    completeService,
    cancelQueue
};
