const prisma = require('../../config/database');

const buildError = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const assertBarberBelongsToTenant = async (barberId, barbershopId) => {
    const barber = await prisma.barber.findFirst({
        where: { id: barberId, barbershopId },
        select: { id: true }
    });
    if (!barber) {
        throw buildError(403, 'Barber is not part of this tenant');
    }
};

/**
 * Get full schedule for a barber (weekly + unavailable slots)
 */
async function getBarberFullSchedule(barberId, barbershopId) {
    await assertBarberBelongsToTenant(barberId, barbershopId);
    const todayStart = getTodayStart();

    const [weekly, unavailable] = await Promise.all([
        prisma.barberSchedule.findMany({
            where: { barberId },
            orderBy: { dayOfWeek: 'asc' }
        }),
        prisma.unavailableSlot.findMany({
            where: {
                barbershopId,
                OR: [
                    { barberId: null },
                    { barberId }
                ],
                date: { gte: todayStart } // include today and future
            },
            orderBy: { date: 'asc' }
        })
    ]);

    return { weekly, unavailable };
}

/**
 * List unavailable slots for tenant (optionally scoped to barber + global slots)
 */
async function listUnavailableSlots(barbershopId, options = {}) {
    const { barberId = null } = options;
    const todayStart = getTodayStart();
    const where = {
        barbershopId,
        date: { gte: todayStart }
    };

    if (barberId) {
        await assertBarberBelongsToTenant(barberId, barbershopId);
        where.OR = [{ barberId: null }, { barberId }];
    }

    return prisma.unavailableSlot.findMany({
        where,
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    });
}

/**
 * Update weekly schedule for a barber
 */
async function updateWeeklySchedule(barberId, barbershopId, schedules) {
    // Validate barber ownership
    const barber = await prisma.barber.findFirst({
        where: { id: barberId, barbershopId }
    });
    if (!barber) throw buildError(404, 'Barber not found');

    // Simple strategy: delete existing and recreate
    // In production, you might want to upsert to keep IDs if referenced
    await prisma.$transaction([
        prisma.barberSchedule.deleteMany({ where: { barberId } }),
        prisma.barberSchedule.createMany({
            data: schedules.map(s => ({
                barberId,
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime,
                isWorkDay: s.isWorkDay ?? true
            }))
        })
    ]);

    return prisma.barberSchedule.findMany({
        where: { barberId },
        orderBy: { dayOfWeek: 'asc' }
    });
}

/**
 * Add unavailable slot
 */
async function addUnavailableSlot(data) {
    const { barbershopId, barberId, date, startTime, endTime, note } = data;

    if (barberId) {
        await assertBarberBelongsToTenant(barberId, barbershopId);
    }

    // date should be a Date object or ISO string
    const dateObj = new Date(date);
    if (Number.isNaN(dateObj.getTime())) {
        throw buildError(400, 'Invalid unavailable slot date');
    }
    dateObj.setHours(0, 0, 0, 0);

    return prisma.unavailableSlot.create({
        data: {
            barbershopId,
            barberId: barberId || null,
            date: dateObj,
            startTime: startTime || null,
            endTime: endTime || null,
            note
        }
    });
}

/**
 * Delete unavailable slot
 */
async function deleteUnavailableSlot(id, barbershopId) {
    const slot = await prisma.unavailableSlot.findFirst({
        where: { id, barbershopId }
    });
    if (!slot) throw buildError(404, 'Unavailable slot not found');

    await prisma.unavailableSlot.delete({ where: { id } });
    return { success: true };
}

module.exports = {
    getBarberFullSchedule,
    listUnavailableSlots,
    updateWeeklySchedule,
    addUnavailableSlot,
    deleteUnavailableSlot
};
