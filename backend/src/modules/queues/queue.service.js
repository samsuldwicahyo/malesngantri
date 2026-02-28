const prisma = require('../../config/database');
const crypto = require('crypto');
const notificationService = require('../../services/notification.service');
const { QueueStatus, canTransition, isActiveQueueStatus } = require('./queue.state');

const buildError = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

const toMinutes = (time) => {
    const [hoursRaw, minutesRaw] = String(time || '').split(':');
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
        return null;
    }
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null;
    }
    return (hours * 60) + minutes;
};

/**
 * Recalculates estimations for all active queues of a barber on a specific date.
 */
async function calculateQueueEstimation(barberId, scheduledDate) {
    const BUFFER_TIME = 5; // minutes between customers
    const dateObj = new Date(scheduledDate);
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

    const currentQueue = await prisma.queue.findFirst({
        where: {
            barberId,
            scheduledDate: { gte: startOfDay, lte: endOfDay },
            status: QueueStatus.IN_SERVICE
        },
        include: { service: true }
    });

    let nextStartTime;
    if (currentQueue && currentQueue.actualStart) {
        const elapsed = (Date.now() - currentQueue.actualStart.getTime()) / 60000;
        const remaining = Math.max(0, currentQueue.estimatedDuration - elapsed);
        nextStartTime = new Date(Date.now() + remaining * 60000);
    } else {
        nextStartTime = new Date();
    }

    const waitingQueues = await prisma.queue.findMany({
        where: {
            barberId,
            scheduledDate: { gte: startOfDay, lte: endOfDay },
            status: { in: [QueueStatus.BOOKED, QueueStatus.CHECKED_IN] }
        },
        include: { service: true },
        orderBy: { position: 'asc' }
    });

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

    await Promise.all(
        updates.map((update) =>
            prisma.queue.update({
                where: { id: update.id },
                data: {
                    estimatedStart: update.estimatedStart,
                    estimatedDuration: update.estimatedDuration,
                    estimatedEnd: update.estimatedEnd
                }
            })
        )
    );

    if (global.io) {
        for (const update of updates) {
            const updatedQueue = await prisma.queue.findUnique({
                where: { id: update.id },
                include: { service: true, barber: true }
            });
            global.io.to(`queue:${update.id}`).emit('queue:updated', updatedQueue);
        }
        global.io.to(`barber:${barberId}`).emit('barber:queue:bulk_updated', { barberId, date: scheduledDate });
    }

    return updates;
}

const assertQueueAccess = (queue, actor, toStatus) => {
    if (actor.role === 'SYSTEM') {
        if (!actor.barbershopId || actor.barbershopId !== queue.barbershopId) {
            throw buildError(403, 'System actor does not match tenant');
        }
        if (toStatus !== QueueStatus.CANCELED) {
            throw buildError(403, 'System actor can only cancel booking');
        }
        return;
    }

    if (actor.role === 'SUPER_ADMIN') {
        throw buildError(403, 'SUPER_ADMIN is not allowed to operate tenant queue workflow');
    }

    if (actor.role === 'CUSTOMER') {
        if (queue.customerId !== actor.userId) {
            throw buildError(403, 'Customer can only access own booking');
        }
        if (toStatus !== QueueStatus.CANCELED) {
            throw buildError(403, 'Customer can only cancel booking');
        }
        return;
    }

    if (actor.role === 'ADMIN') {
        if (!actor.barbershopId || queue.barbershopId !== actor.barbershopId) {
            throw buildError(403, 'Admin can only access booking in own tenant');
        }
        return;
    }

    if (actor.role === 'BARBER') {
        if (!actor.barberId) {
            throw buildError(403, 'Barber profile is required');
        }
        if (queue.barberId !== actor.barberId) {
            throw buildError(403, 'Barber can only operate own booking list');
        }
        return;
    }

    throw buildError(403, 'Unsupported actor role');
};

/**
 * CREATE QUEUE (booking/walk-in)
 */
async function createQueue(data) {
    const {
        barbershopId,
        barberId,
        customerId,
        serviceId,
        bookingType,
        customerName,
        customerPhone,
        scheduledDate,
        scheduledTime,
        initialStatus = QueueStatus.BOOKED
    } = data;

    if (![QueueStatus.BOOKED, QueueStatus.CHECKED_IN].includes(initialStatus)) {
        throw buildError(400, 'Invalid initial booking status');
    }

    const dateObj = new Date(scheduledDate);
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

    const [barber, service] = await Promise.all([
        prisma.barber.findFirst({
            where: { id: barberId, barbershopId, deletedAt: null },
            include: { schedules: true }
        }),
        prisma.service.findFirst({
            where: { id: serviceId, barbershopId }
        })
    ]);

    if (!barber) {
        throw buildError(404, 'Barber not found for this tenant');
    }

    if (!service) {
        throw buildError(404, 'Service not found for this tenant');
    }

    if (!scheduledTime) {
        throw buildError(400, 'scheduledTime is required');
    }

    const [scheduledHour = '', scheduledMinute = ''] = String(scheduledTime).split(':');
    const normalizedScheduledTime = `${scheduledHour.padStart(2, '0')}:${scheduledMinute.padStart(2, '0')}`;
    const scheduledMinutes = toMinutes(normalizedScheduledTime);
    if (scheduledMinutes === null) {
        throw buildError(400, 'scheduledTime format is invalid');
    }

    // --- Schedule & Slot availability checks (always enforced) ---
    const dayOfWeek = dateObj.getDay(); // 0=Sunday, 1=Monday...

    // 1. Weekly Schedule Check
    const daySchedule = barber.schedules.find((s) => s.dayOfWeek === dayOfWeek);
    if (!daySchedule || !daySchedule.isWorkDay) {
        throw buildError(409, 'Barber does not work on this day');
    }

    const scheduleStartMinutes = toMinutes(daySchedule.startTime);
    const scheduleEndMinutes = toMinutes(daySchedule.endTime);
    if (scheduleStartMinutes === null || scheduleEndMinutes === null) {
        throw buildError(500, 'Invalid barber schedule configuration');
    }

    if (scheduledMinutes < scheduleStartMinutes || scheduledMinutes >= scheduleEndMinutes) {
        throw buildError(409, `Barber only works between ${daySchedule.startTime} and ${daySchedule.endTime}`);
    }

    // 2. Specific Closures (UnavailableSlot)
    const closure = await prisma.unavailableSlot.findFirst({
        where: {
            barbershopId,
            date: startOfDay,
            AND: [
                {
                    OR: [
                        { barberId: null }, // Shop closure
                        { barberId }        // Barber-specific closure
                    ]
                },
                {
                    OR: [
                        { startTime: null }, // Whole day closure
                        {
                            AND: [
                                { startTime: { lte: normalizedScheduledTime } },
                                { endTime: { gt: normalizedScheduledTime } }
                            ]
                        }
                    ]
                }
            ]
        }
    });

    if (closure) {
        throw buildError(409, closure.note || 'Slot is manually closed by admin');
    }

    // 3. Double-Booking Prevention (Active Queue check)
    const existingActiveQueue = await prisma.queue.findFirst({
        where: {
            barberId,
            scheduledDate: startOfDay,
            scheduledTime: normalizedScheduledTime,
            status: { in: [QueueStatus.BOOKED, QueueStatus.CHECKED_IN, QueueStatus.IN_SERVICE] }
        }
    });

    if (existingActiveQueue) {
        throw buildError(409, 'This slot is already booked');
    }
    // --- End checks ---

    const todayQueuesCount = await prisma.queue.count({
        where: {
            barbershopId,
            scheduledDate: { gte: startOfDay, lte: endOfDay }
        }
    });
    const queueNumber = `A${String(todayQueuesCount + 1).padStart(3, '0')}`;

    const lastPosition = await prisma.queue.findFirst({
        where: {
            barberId,
            scheduledDate: { gte: startOfDay, lte: endOfDay }
        },
        orderBy: { position: 'desc' },
        select: { position: true }
    });
    const position = (lastPosition?.position || 0) + 1;

    let queue;
    try {
        queue = await prisma.queue.create({
            data: {
                queueNumber,
                barbershopId,
                barberId,
                customerId,
                serviceId,
                customerName,
                customerPhone,
                bookingType,
                scheduledDate: startOfDay,
                scheduledTime: normalizedScheduledTime,
                position,
                estimatedDuration: service.duration,
                status: initialStatus,
                cancelToken: !customerId ? crypto.randomBytes(16).toString('hex') : null,
                estimatedStart: new Date(),
                estimatedEnd: new Date()
            }
        });
    } catch (error) {
        if (error?.code === 'P2002') {
            throw buildError(409, 'This slot is already booked');
        }
        throw error;
    }

    await calculateQueueEstimation(barberId, startOfDay);

    const updatedQueue = await prisma.queue.findUnique({
        where: { id: queue.id },
        include: {
            service: true,
            barber: true,
            barbershop: true,
            customer: { select: { fullName: true } }
        }
    });

    await prisma.queueHistory.create({
        data: {
            queueId: queue.id,
            status: initialStatus,
            note: `Queue created via ${bookingType}`
        }
    });

    if (global.io) {
        global.io.to(`barber:${barberId}`).emit('queue:new', updatedQueue);
    }

    if (updatedQueue.customerPhone) {
        await notificationService.sendBookingConfirmation(updatedQueue);
    }

    return updatedQueue;
}

const transitionQueueStatus = async (queueId, actor, toStatus, options = {}) => {
    const queue = await prisma.queue.findUnique({
        where: { id: queueId },
        include: { service: true, barber: true, barbershop: true }
    });

    if (!queue) {
        throw buildError(404, 'Queue not found');
    }

    assertQueueAccess(queue, actor, toStatus);

    if (!canTransition(queue.status, toStatus)) {
        throw buildError(400, `Invalid booking transition: ${queue.status} -> ${toStatus}`);
    }

    if (toStatus === QueueStatus.IN_SERVICE) {
        const activeQueue = await prisma.queue.findFirst({
            where: {
                barberId: queue.barberId,
                status: QueueStatus.IN_SERVICE,
                NOT: { id: queue.id }
            }
        });
        if (activeQueue) {
            throw buildError(409, 'Finish current customer first');
        }
    }

    const now = new Date();
    const updateData = {
        status: toStatus,
        statusChangedAt: now
    };

    if (toStatus === QueueStatus.IN_SERVICE) {
        updateData.actualStart = now;
    }

    if (toStatus === QueueStatus.DONE) {
        const durationMinutes = queue.actualStart
            ? Math.max(1, Math.round((now.getTime() - queue.actualStart.getTime()) / 60000))
            : queue.estimatedDuration;

        updateData.actualEnd = now;
        updateData.actualDuration = durationMinutes;
    }

    if (toStatus === QueueStatus.CANCELED) {
        updateData.cancelReason = options.reason || null;
        updateData.cancelledBy = actor.userId || null;
    }

    const updatedCount = await prisma.queue.updateMany({
        where: {
            id: queueId,
            barbershopId: queue.barbershopId,
            status: queue.status
        },
        data: updateData
    });
    if (updatedCount.count === 0) {
        throw buildError(409, 'Queue status update conflict');
    }

    const updated = await prisma.queue.findUnique({
        where: { id: queueId },
        include: {
            service: true,
            barber: true,
            barbershop: true,
            customer: { select: { id: true, fullName: true, phoneNumber: true } }
        }
    });
    if (!updated) {
        throw buildError(404, 'Queue not found after update');
    }

    if (toStatus === QueueStatus.IN_SERVICE) {
        await prisma.barber.update({
            where: { id: queue.barberId },
            data: { status: 'BUSY' }
        });
    }

    if (toStatus === QueueStatus.DONE) {
        await prisma.barber.update({
            where: { id: queue.barberId },
            data: {
                status: 'AVAILABLE',
                totalCustomers: { increment: 1 }
            }
        });
    }

    await prisma.queueHistory.create({
        data: {
            queueId,
            status: toStatus,
            changedBy: actor.userId || null,
            note: options.note || options.reason || null
        }
    });

    await calculateQueueEstimation(queue.barberId, queue.scheduledDate);

    if (global.io) {
        global.io.to(`queue:${queueId}`).emit('queue:status_changed', updated);
        global.io.to(`barber:${queue.barberId}`).emit('barber:queue:updated', updated);
    }

    if (toStatus === QueueStatus.IN_SERVICE && updated.customerPhone) {
        await notificationService.sendYourTurn(updated);
    }

    if (toStatus === QueueStatus.DONE && updated.customerPhone) {
        await notificationService.sendPostService(updated);
    }

    return updated;
};

async function checkInQueue(queueId, actor, note) {
    return transitionQueueStatus(queueId, actor, QueueStatus.CHECKED_IN, {
        note: note || 'Customer checked in'
    });
}

async function startService(queueId, actor, note) {
    return transitionQueueStatus(queueId, actor, QueueStatus.IN_SERVICE, {
        note: note || 'Service started'
    });
}

async function completeService(queueId, actor, note) {
    return transitionQueueStatus(queueId, actor, QueueStatus.DONE, {
        note: note || 'Service completed'
    });
}

async function markNoShow(queueId, actor, options = {}) {
    const reason = options.reason || options.note || 'Customer no show';
    return transitionQueueStatus(queueId, actor, QueueStatus.NO_SHOW, {
        reason,
        note: options.note || options.reason || 'Customer no show'
    });
}

/**
 * GET CUSTOMER'S CURRENT QUEUE
 */
async function getMyQueue(customerId) {
    const queue = await prisma.queue.findFirst({
        where: {
            customerId,
            status: { in: [QueueStatus.BOOKED, QueueStatus.CHECKED_IN, QueueStatus.IN_SERVICE] }
        },
        include: {
            service: true,
            barber: true,
            barbershop: { select: { name: true, address: true, slug: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    if (!queue) return null;

    const adminUser = await prisma.user.findFirst({
        where: { barbershopId: queue.barbershopId, role: 'ADMIN' },
        select: { phoneNumber: true }
    });

    const queuesAhead = await prisma.queue.findMany({
        where: {
            barberId: queue.barberId,
            scheduledDate: queue.scheduledDate,
            position: { lt: queue.position },
            status: { in: [QueueStatus.BOOKED, QueueStatus.CHECKED_IN, QueueStatus.IN_SERVICE] }
        },
        include: { service: true },
        orderBy: { position: 'asc' }
    });

    const now = new Date();
    const remainingMinutes = Math.round((queue.estimatedStart.getTime() - now.getTime()) / 60000);

    return {
        ...queue,
        barbershop: {
            ...queue.barbershop,
            phoneNumber: adminUser?.phoneNumber || null
        },
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

    const where = {
        barberId,
        scheduledDate: { gte: startOfDay, lte: endOfDay }
    };

    if (status) {
        where.status = status;
    } else {
        where.status = { in: Object.values(QueueStatus) };
    }

    return prisma.queue.findMany({
        where,
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
async function cancelQueue(queueId, actor, reason) {
    return transitionQueueStatus(queueId, actor, QueueStatus.CANCELED, { reason });
}

module.exports = {
    QueueStatus,
    canTransition,
    isActiveQueueStatus,
    calculateQueueEstimation,
    createQueue,
    transitionQueueStatus,
    checkInQueue,
    startService,
    completeService,
    markNoShow,
    getMyQueue,
    getBarberQueues,
    cancelQueue
};
