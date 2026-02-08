const whatsappService = require('./whatsapp.service');
const prisma = require('../config/database');

class NotificationService {

    // Template 1: Booking Confirmation
    async sendBookingConfirmation(queue) {
        const { queueNumber, customerPhone, customerName, scheduledDate, estimatedStart, service, barber, barbershop } = queue;

        const trackingUrl = `${process.env.FRONTEND_URL}/tracking/${queue.id}`;
        const formattedDate = new Date(scheduledDate).toLocaleDateString('id-ID');
        const formattedTime = new Date(estimatedStart).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        const message = `
[${barbershop.name}]
✅ *Booking Berhasil!*

Nomor Antrian: *${queueNumber}*
Barber: ${barber.name}
Tanggal: ${formattedDate}
Estimasi: ${formattedTime}

Layanan: ${service.name}
Harga: Rp ${service.price.toLocaleString('id-ID')}

Track antrian real-time:
${trackingUrl}

Jangan lupa datang tepat waktu! 😊
    `.trim();

        const result = await whatsappService.sendMessage(customerPhone, message);

        // Log notification
        await this.logNotification({
            queueId: queue.id,
            type: 'BOOKING_CONFIRMATION',
            recipient: customerPhone,
            message,
            status: result.success ? 'SENT' : 'FAILED',
            errorMessage: result.error
        });

        return result;
    }

    // Template 2: T-30 Minutes Alert
    async sendT30Alert(queue) {
        const { queueNumber, customerPhone, estimatedStart, barbershop, barber } = queue;

        const trackingUrl = `${process.env.FRONTEND_URL}/tracking/${queue.id}`;
        const formattedTime = new Date(estimatedStart).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        // Calculate travel time (simple: assume 15 min)
        const travelTime = 15;

        const message = `
[${barbershop.name}]
⏰ *WAKTUNYA BERSIAP!*

Antrian Anda tinggal *30 menit* lagi!
Nomor: ${queueNumber}
Estimasi giliran: ${formattedTime}

🚗 Perkiraan waktu perjalanan: ${travelTime} menit
📍 Lokasi: ${barbershop.address || 'Barbershop'}

⚠️ Sebaiknya berangkat sekarang!

Track real-time:
${trackingUrl}
    `.trim();

        const result = await whatsappService.sendMessage(customerPhone, message);

        await this.logNotification({
            queueId: queue.id,
            type: 'T_MINUS_30',
            recipient: customerPhone,
            message,
            status: result.success ? 'SENT' : 'FAILED',
            errorMessage: result.error
        });

        return result;
    }

    // Template 3: T-15 Minutes Urgent
    async sendT15Alert(queue) {
        const { queueNumber, customerPhone, barbershop } = queue;

        const trackingUrl = `${process.env.FRONTEND_URL}/tracking/${queue.id}`;

        const message = `
[${barbershop.name}]
🔔 *SEGERA BERANGKAT!*

Antrian Anda tinggal *15 menit* lagi!
Nomor: ${queueNumber}

⚠️ Jika terlambat >15 menit, antrian akan dibatalkan otomatis.

Track: ${trackingUrl}
    `.trim();

        const result = await whatsappService.sendMessage(customerPhone, message);

        await this.logNotification({
            queueId: queue.id,
            type: 'T_MINUS_15',
            recipient: customerPhone,
            message,
            status: result.success ? 'SENT' : 'FAILED'
        });

        return result;
    }

    // Template 4: Next in Line
    async sendNextInLine(queue) {
        const { queueNumber, customerPhone, barbershop } = queue;

        const message = `
[${barbershop.name}]
🚀 *ANDA SELANJUTNYA!*

Nomor: ${queueNumber}
Customer sebelum Anda hampir selesai (~5 menit).

Pastikan Anda sudah di barbershop!
    `.trim();

        const result = await whatsappService.sendMessage(customerPhone, message);

        await this.logNotification({
            queueId: queue.id,
            type: 'NEXT_IN_LINE',
            recipient: customerPhone,
            message,
            status: result.success ? 'SENT' : 'FAILED'
        });

        return result;
    }

    // Template 5: Your Turn!
    async sendYourTurn(queue) {
        const { queueNumber, customerPhone, barbershop, barber } = queue;

        const message = `
[${barbershop.name}]
💈 *GILIRAN ANDA SEKARANG!*

Silakan menuju ke kursi ${barber.name}.
Nomor Antrian: ${queueNumber}

Selamat cukur! ✂️
    `.trim();

        const result = await whatsappService.sendMessage(customerPhone, message);

        await this.logNotification({
            queueId: queue.id,
            type: 'YOUR_TURN',
            recipient: customerPhone,
            message,
            status: result.success ? 'SENT' : 'FAILED'
        });

        return result;
    }

    // Template 6: Post Service (Rating Request)
    async sendPostService(queue) {
        const { queueNumber, customerPhone, barbershop, barber, service } = queue;

        const ratingUrl = `${process.env.FRONTEND_URL}/review/${queue.id}`;

        const message = `
[${barbershop.name}]
✅ *Terima kasih sudah datang!*

Total Pembayaran: Rp ${service.price.toLocaleString('id-ID')}
Barber: ${barber.name}

Bagaimana pengalaman Anda?
Beri rating: ${ratingUrl}

Sampai jumpa lagi! 😊
    `.trim();

        const result = await whatsappService.sendMessage(customerPhone, message);

        await this.logNotification({
            queueId: queue.id,
            type: 'POST_SERVICE',
            recipient: customerPhone,
            message,
            status: result.success ? 'SENT' : 'FAILED'
        });

        return result;
    }

    // Log notification to database
    async logNotification(data) {
        try {
            await prisma.notification.create({
                data: {
                    queueId: data.queueId,
                    type: data.type,
                    recipient: data.recipient,
                    message: data.message,
                    status: data.status,
                    errorMessage: data.errorMessage,
                    sentAt: new Date()
                }
            });
        } catch (error) {
            console.error('[NotificationService] Failed to log notification:', error);
        }
    }
}

module.exports = new NotificationService();
