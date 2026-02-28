const scheduleService = require('./schedule.service');

const getBarberSchedule = async (req, res, next) => {
    try {
        const { barberId } = req.params;
        const barbershopId = req.tenantBarbershopId || req.user.barbershopId;
        const data = await scheduleService.getBarberFullSchedule(barberId, barbershopId);
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const listUnavailableSlots = async (req, res, next) => {
    try {
        const barbershopId = req.tenantBarbershopId || req.user.barbershopId;
        const barberId = req.query?.barberId || null;
        const data = await scheduleService.listUnavailableSlots(barbershopId, { barberId });
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const updateWeeklySchedule = async (req, res, next) => {
    try {
        const { barberId } = req.params;
        const { schedules } = req.body;
        const barbershopId = req.tenantBarbershopId || req.user.barbershopId;

        const data = await scheduleService.updateWeeklySchedule(barberId, barbershopId, schedules);
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const addUnavailableSlot = async (req, res, next) => {
    try {
        const barbershopId = req.tenantBarbershopId || req.user.barbershopId;
        const data = await scheduleService.addUnavailableSlot({
            ...req.body,
            barbershopId
        });
        res.status(201).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const deleteUnavailableSlot = async (req, res, next) => {
    try {
        const { id } = req.params;
        const barbershopId = req.tenantBarbershopId || req.user.barbershopId;
        const data = await scheduleService.deleteUnavailableSlot(id, barbershopId);
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBarberSchedule,
    listUnavailableSlots,
    updateWeeklySchedule,
    addUnavailableSlot,
    deleteUnavailableSlot
};
