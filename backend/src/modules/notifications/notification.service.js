const { sendWhatsApp } = require('../utils/whatsapp.util');

/**
 * Templates for various queue stages
 */
const templates = {
    BOOKING_CONFIRMED: (data) =>
        `Halo ${data.customerName}! 💈\n\nBooking Anda di *${data.barbershopName}* telah dikonfirmasi.\n` +
        `No. Antrian: *${data.queueNumber}*\n` +
        `Layanan: ${data.serviceName}\n` +
        `Barber: ${data.barberName}\n` +
        `Estimasi Mulai: ${data.estimatedTime}\n\n` +
        `Pantau antrian Anda di sini: ${data.trackingUrl}\n` +
        `Terima kasih telah memilih kami!`,

    REMINDER_H1: (data) =>
        `Reminder H-1 💈\n\nHalo ${data.customerName}, besok Anda memiliki jadwal di *${data.barbershopName}* jam *${data.scheduledTime}*.\n` +
        `Jangan sampai terlambat ya! 😊`,

    REMINDER_T30: (data) =>
        `Waktunya Berangkat! 💈\n\nHalo ${data.customerName}, estimasi giliran Anda di *${data.barbershopName}* adalah dalam *30 menit* lagi.\n` +
        `Silakan menuju ke lokasi agar tidak terlewat.`,

    YOUR_TURN: (data) =>
        `SEKARANG GILIRAN ANDA! 💈🔥\n\nHalo ${data.customerName}, Barber *${data.barberName}* sudah siap melayani Anda di *${data.barbershopName}*.\n` +
        `Segera masuk ke area barbershop ya!`,

    COMPLETED: (data) =>
        `Terima Kasih! 💈✨\n\nHalo ${data.customerName}, layanan Anda dengan *${data.barberName}* telah selesai.\n\n` +
        `Punya waktu sebentar? Berikan rating & ulasan Anda di sini: ${data.reviewUrl}\n` +
        `Sampai jumpa di kunjungan berikutnya!`,

    DELAY_ALERT: (data) =>
        `Pemberitahuan Penundaan 💈⚠️\n\nHalo ${data.customerName}, mohon maaf antrian di *${data.barbershopName}* sedikit lebih lambat dari estimasi.\n` +
        `Giliran Anda kini diestimasikan mulai pada: *${data.newTime}*\n` +
        `Terima kasih atas kesabaran Anda.`
};

/**
 * Send notification based on type
 */
const notify = async (type, payload) => {
    const { phone } = payload;
    if (!phone) return;

    const templateFn = templates[type];
    if (!templateFn) {
        console.error(`Unknown notification template: ${type}`);
        return;
    }

    const message = templateFn(payload);
    return await sendWhatsApp(phone, message);
};

module.exports = {
    notify
};
