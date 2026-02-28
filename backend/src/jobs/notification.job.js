const cron = require('node-cron');
const prisma = require('../config/database');
const notificationService = require('../services/notification.service');

class NotificationJob {
    constructor() {
        this.task = null;
        this.lastDbUnavailableLogAt = 0;
    }

    // Run every minute to check for T-30 and T-15 notifications
    start() {
        if (String(process.env.DISABLE_NOTIFICATION_JOB || '').toLowerCase() === 'true') {
            console.log('[NotificationJob] Disabled by DISABLE_NOTIFICATION_JOB=true');
            return;
        }

        this.task = cron.schedule('* * * * *', async () => {
            try {
                console.log('[NotificationJob] Checking for scheduled notifications...');
                await this.checkT30Notifications();
                await this.checkT15Notifications();
                await this.checkNextInLineNotifications();
            } catch (error) {
                const isDbUnavailable =
                    typeof prisma.isDbUnavailableError === 'function' && prisma.isDbUnavailableError(error);

                if (isDbUnavailable) {
                    const now = Date.now();
                    // Prevent noisy logs every minute when DB is down.
                    if (now - this.lastDbUnavailableLogAt > 60_000) {
                        console.warn('[NotificationJob] Database unavailable, skipping this cycle.');
                        this.lastDbUnavailableLogAt = now;
                    }
                    return;
                }

                console.error('[NotificationJob] Unexpected error:', error);
            }
        });

        console.log('[NotificationJob] Started');
    }

    async checkT30Notifications() {
        const now = new Date();
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);
        const twentyNineMinutesFromNow = new Date(now.getTime() + 29 * 60000);

        // Find queues that will start in 30 minutes (within 1-minute window)
        const queues = await prisma.queue.findMany({
            where: {
                status: { in: ['BOOKED', 'CHECKED_IN'] },
                estimatedStart: {
                    gte: twentyNineMinutesFromNow,
                    lte: thirtyMinutesFromNow
                }
            },
            select: this.queueNotificationSelect()
        });

        for (const queue of queues) {
            // Check if T-30 notification already sent
            const alreadySent = await prisma.notification.findFirst({
                where: {
                    queueId: queue.id,
                    type: 'T_MINUS_30', // adjusted from T_MINUS_30 to fit common enum or just literal
                    status: 'SENT'
                }
            });

            if (!alreadySent && queue.customerPhone) {
                console.log(`[NotificationJob] Sending T-30 to ${queue.customerPhone}`);
                await notificationService.sendT30Alert(queue);
            }
        }
    }

    async checkT15Notifications() {
        const now = new Date();
        const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60000);
        const fourteenMinutesFromNow = new Date(now.getTime() + 14 * 60000);

        const queues = await prisma.queue.findMany({
            where: {
                status: { in: ['BOOKED', 'CHECKED_IN'] },
                estimatedStart: {
                    gte: fourteenMinutesFromNow,
                    lte: fifteenMinutesFromNow
                }
            },
            select: this.queueNotificationSelect()
        });

        for (const queue of queues) {
            const alreadySent = await prisma.notification.findFirst({
                where: {
                    queueId: queue.id,
                    type: 'T_MINUS_15',
                    status: 'SENT'
                }
            });

            if (!alreadySent && queue.customerPhone) {
                console.log(`[NotificationJob] Sending T-15 to ${queue.customerPhone}`);
                await notificationService.sendT15Alert(queue);
            }
        }
    }

    async checkNextInLineNotifications() {
        // Find queues where position = 2 (next in line)
        const queues = await prisma.queue.findMany({
            where: {
                status: { in: ['BOOKED', 'CHECKED_IN'] },
                position: 2
            },
            select: this.queueNotificationSelect()
        });

        for (const queue of queues) {
            const alreadySent = await prisma.notification.findFirst({
                where: {
                    queueId: queue.id,
                    type: 'NEXT_IN_LINE',
                    status: 'SENT'
                }
            });

            if (!alreadySent && queue.customerPhone) {
                console.log(`[NotificationJob] Sending Next in Line to ${queue.customerPhone}`);
                await notificationService.sendNextInLine(queue);
            }
        }
    }

    queueNotificationSelect() {
        return {
            id: true,
            queueNumber: true,
            customerName: true,
            customerPhone: true,
            scheduledDate: true,
            estimatedStart: true,
            estimatedEnd: true,
            status: true,
            position: true,
            service: {
                select: {
                    id: true,
                    name: true,
                    price: true
                }
            },
            barber: {
                select: {
                    id: true,
                    name: true
                }
            },
            barbershop: {
                select: {
                    id: true,
                    name: true,
                    address: true
                }
            }
        };
    }
}

module.exports = new NotificationJob();
