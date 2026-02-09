const cron = require('node-cron');
const prisma = require('../config/database');
const notificationService = require('../services/notification.service');

class NotificationJob {

    // Run every minute to check for T-30 and T-15 notifications
    start() {
        cron.schedule('* * * * *', async () => {
            console.log('[NotificationJob] Checking for scheduled notifications...');
            await this.checkT30Notifications();
            await this.checkT15Notifications();
            await this.checkNextInLineNotifications();
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
                status: 'WAITING',
                estimatedStart: {
                    gte: twentyNineMinutesFromNow,
                    lte: thirtyMinutesFromNow
                }
            },
            include: {
                service: true,
                barber: true,
                barbershop: true
            }
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
                status: 'WAITING',
                estimatedStart: {
                    gte: fourteenMinutesFromNow,
                    lte: fifteenMinutesFromNow
                }
            },
            include: {
                service: true,
                barber: true,
                barbershop: true
            }
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
                status: 'WAITING',
                position: 2
            },
            include: {
                service: true,
                barber: true,
                barbershop: true
            }
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
}

module.exports = new NotificationJob();
