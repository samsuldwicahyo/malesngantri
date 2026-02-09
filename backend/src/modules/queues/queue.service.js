const prisma = require('../../config/database');
const notificationService = require('../../services/notification.service');

/**
 * FUNGSI UTAMA: Calculate Estimated Time
 * Recalculates estimations for all waiting queues of a barber on a specific date.
 */
async function calculateQueueEstimation(barberId, scheduledDate) {
    const BUFFER_TIME = 5; // minutes between customers
    const dateObj = new Date(scheduledDate);
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

    // 1. Get current queue in progress
    const currentQueue = await prisma.queue.findFirst({
        where: {
            barberId,
            scheduledDate: { gte: startOfDay, lte: endOfDay },
            status: 'IN_PROGRESS'
        },
        include: { service: true }
    });

    let nextStartTime;
    if (currentQueue && currentQueue.actualStart) {
        // Calculate remaining time for current customer
        const elapsed = (Date.now() - currentQueue.actualStart.getTime()) / 60000; // in minutes
        const remaining = Math.max(0, currentQueue.estimatedDuration - elapsed);
        nextStartTime = new Date(Date.now() + remaining * 60000);
    } else {
        // No current queue, start from now
        nextStartTime = new Date();
    }

    // 2. Get all waiting queues
    const waitingQueues = await prisma.queue.findMany({
        where: {
            barberId,
            scheduledDate: { gte: startOfDay, lte: endOfDay },
            status: 'WAITING'
        },
        include: { service: true },
        orderBy: { position: 'asc' }
    });

    // 3. Calculate estimation for each queue
    const updates = [];
    let currentEstimatedEnd = nextStartTime;

    for (const queue of waitingQueues) {
        const estimatedStart = new Date(currentEstimatedEnd.getTime() + BUFFER_TIME * 60000);
        const estimatedEnd = new Date(estimatedStart.getTime() + queue.service.duration * 60000);

        updates.push({
            id: queue.id,
            estimatedStart,
            estimatedDuration: queue.service.duration,
            estimatedEnd
        });

        currentEstimatedEnd = estimatedEnd;
    }

    // 4. Batch update
    await Promise.all(updates.map(update =>
        prisma.queue.update({
            where: { id: update.id },
            data: {
                estimatedStart: update.estimatedStart,
                estimatedDuration: update.estimatedDuration,
                estimatedEnd: update.estimatedEnd
            }
        })
    ));

    // Emit real-time updates for all waiting queues
    if (global.io) {
        for (const update of updates) {
            const updatedQueue = await prisma.queue.findUnique({
                where: { id: update.id },
                include: { service: true, barber: true }
            });
            global.io.to(`queue:${update.id}`).emit('queue:updated', updatedQueue);
        }
        // Also notify the barber's room
        global.io.to(`barber:${barberId}`).emit('barber:queue:bulk_updated', { barberId, date: scheduledDate });
    }

    return updates;
}

/**
 * CREATE QUEUE (booking/walk-in)
 */
async function createQueue(data) {
    const {
        barbershopId, barberId, customerId, serviceId,
        bookingType, customerName, customerPhone, scheduledDate
    } = data;

    const dateObj = new Date(scheduledDate);
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

    // 1. Generate queue number (e.g., A001, A002)
    const todayQueuesCount = await prisma.queue.count({
        where: {
            barbershopId,
            scheduledDate: { gte: startOfDay, lte: endOfDay }
        }
    });
    const queueNumber = `A${String(todayQueuesCount + 1).padStart(3, '0')}`;

    // 2. Get next position for this barber
    const lastPosition = await prisma.queue.findFirst({
        where: {
            barberId,
            scheduledDate: { gte: startOfDay, lte: endOfDay }
        },
        orderBy: { position: 'desc' },
        select: { position: true }
    });
    const position = (lastPosition?.position || 0) + 1;

    // 3. Get service details
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new Error('Service not found');

    // 4. Create queue
    const queue = await prisma.queue.create({
        data: {
            queueNumber,
            barbershopId,
            barberId,
            customerId,
            serviceId,
            customerName,
            customerPhone,
            bookingType,
            scheduledDate: startOfDay, // Normalize to start of day
            position,
            estimatedDuration: service.duration,
            status: 'WAITING',
            estimatedStart: new Date(), // Initial placeholder
            estimatedEnd: new Date()    // Initial placeholder
        }
    });

    // 5. Recalculate all estimations for this barber/day
    await calculateQueueEstimation(barberId, startOfDay);

    // 6. Get updated queue with estimations
    const updatedQueue = await prisma.queue.findUnique({
        where: { id: queue.id },
        include: { service: true, barber: true, customer: { select: { fullName: true } } }
    });

    // 7. Create history log
    await prisma.queueHistory.create({
        data: {
            queueId: queue.id,
            status: 'WAITING',
            note: `Queue created via ${bookingType}`
        }
    });

    // 8. Real-time emit
    if (global.io) {
        global.io.to(`barber:${barberId}`).emit('queue:new', updatedQueue);
    }

    // 9. WhatsApp Notification (Booking Confirmed)
    if (updatedQueue.customerPhone) {
        await notificationService.sendBookingConfirmation(updatedQueue);
    }

    return updatedQueue;
}

/**
 * START SERVICE
 */
async function startService(queueId, barberId) {
    const queue = await prisma.queue.findFirst({
        where: { id: queueId, barberId, status: 'WAITING' }
    });

    if (!queue) {
        throw new Error('Queue not found or already started');
    }

    const activeQueue = await prisma.queue.findFirst({
        where: { barberId, status: 'IN_PROGRESS' }
    });

    if (activeQueue) {
        throw new Error('Finish current customer first');
    }

    const updated = await prisma.queue.update({
        where: { id: queueId },
        data: {
            status: 'IN_PROGRESS',
            actualStart: new Date(),
            statusChangedAt: new Date()
        },
        include: { service: true, barber: true }
    });

    // Update barber status
    await prisma.barber.update({
        where: { id: barberId },
        data: { status: 'BUSY' }
    });

    await prisma.queueHistory.create({
        data: {
            queueId,
            status: 'IN_PROGRESS',
            changedBy: barberId,
            note: 'Service started'
        }
    });

    await calculateQueueEstimation(barberId, queue.scheduledDate);

    if (global.io) {
        global.io.to(`queue:${queueId}`).emit('queue:status_changed', updated);
        global.io.to(`barber:${barberId}`).emit('barber:status_changed', { barberId, status: 'BUSY' });
    }

    // 7. WhatsApp Notification (Your Turn)
    if (updated.customerPhone) {
        await notificationService.sendYourTurn(updated);
    }

    return updated;
}

/**
 * COMPLETE SERVICE
 */
async function completeService(queueId, barberId) {
    const queue = await prisma.queue.findFirst({
        where: { id: queueId, barberId, status: 'IN_PROGRESS' }
    });

    if (!queue) {
        throw new Error('Queue not found or not in progress');
    }

    const actualDuration = Math.round((Date.now() - queue.actualStart.getTime()) / 60000);

    const updated = await prisma.queue.update({
        where: { id: queueId },
        data: {
            status: 'COMPLETED',
            actualEnd: new Date(),
            actualDuration,
            statusChangedAt: new Date()
        },
        include: { service: true, barber: true }
    });

    await prisma.barber.update({
        where: { id: barberId },
        data: {
            status: 'AVAILABLE',
            totalCustomers: { increment: 1 }
        }
    });

    await prisma.queueHistory.create({
        data: {
            queueId,
            status: 'COMPLETED',
            changedBy: barberId,
            note: `Completed in ${actualDuration} minutes`
        }
    });

    await calculateQueueEstimation(barberId, queue.scheduledDate);

    if (global.io) {
        global.io.to(`queue:${queueId}`).emit('queue:status_changed', updated);
        global.io.to(`barber:${barberId}`).emit('barber:status_changed', { barberId, status: 'AVAILABLE' });
    }

    // 7. WhatsApp Notification (Completed)
    if (updated.customerPhone) {
        await notificationService.sendPostService(updated);
    }

    return updated;
}

/**
 * GET CUSTOMER'S CURRENT QUEUE
 */
async function getMyQueue(customerId) {
    const queue = await prisma.queue.findFirst({
        where: {
            customerId,
            status: { in: ['WAITING', 'CALLED', 'IN_PROGRESS'] }
        },
        include: {
            service: true,
            barber: true,
            barbershop: { select: { name: true, address: true, phoneNumber: true, slug: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    if (!queue) return null;

    const queuesAhead = await prisma.queue.findMany({
        where: {
            barberId: queue.barberId,
            scheduledDate: queue.scheduledDate,
            position: { lt: queue.position },
            status: { in: ['IN_PROGRESS', 'WAITING'] }
        },
        include: { service: true },
        orderBy: { position: 'asc' }
    });

    const now = new Date();
    const remainingMinutes = Math.round((queue.estimatedStart.getTime() - now.getTime()) / 60000);

    return {
        ...queue,
        queuesAhead,
        remainingMinutes: Math.max(0, remainingMinutes),
        positionInQueue: queue.position,
        totalQueueCount: queuesAhead.length + 1
    };
}

/**
 * GET BARBER QUEUES
 */
async function getBarberQueues(barberId, date, status) {
    const dateObj = new Date(date || new Date());
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

    return await prisma.queue.findMany({
        where: {
            barberId,
            scheduledDate: { gte: startOfDay, lte: endOfDay },
            ...(status && { status })
        },
        include: {
            service: true,
            customer: { select: { fullName: true, phoneNumber: true } }
        },
        orderBy: { position: 'asc' }
    });
}

/**
 * CANCEL QUEUE
 */
async function cancelQueue(queueId, userId, reason) {
    const queue = await prisma.queue.findUnique({
        where: { id: queueId }
    });

    if (!queue) throw new Error('Queue not found');
    if (['COMPLETED', 'CANCELLED'].includes(queue.status)) {
        throw new Error('Cannot cancel a finished or already cancelled queue');
    }

    const updated = await prisma.queue.update({
        where: { id: queueId },
        data: {
            status: 'CANCELLED',
            cancelReason: reason,
            cancelledBy: userId,
            statusChangedAt: new Date()
        },
        include: { service: true, barber: true }
    });

    // If was active, set barber to AVAILABLE
    if (queue.status === 'IN_PROGRESS') {
        await prisma.barber.update({
            where: { id: queue.barberId },
            data: { status: 'AVAILABLE' }
        });
    }

    await prisma.queueHistory.create({
        data: {
            queueId,
            status: 'CANCELLED',
            changedBy: userId,
            note: reason
        }
    });

    // Recalculate
    await calculateQueueEstimation(queue.barberId, queue.scheduledDate);

    if (global.io) {
        global.io.to(`queue:${queueId}`).emit('queue:cancelled', updated);
        global.io.to(`barber:${queue.barberId}`).emit('queue:cancelled', updated);
    }

    // WhatsApp Notification (Optional, maybe just for customer if admin cancels)
    // ...

    return updated;
}

module.exports = {
    calculateQueueEstimation,
    createQueue,
    startService,
    completeService,
    getMyQueue,
    getBarberQueues,
    cancelQueue
};
