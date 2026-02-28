const workerService = require('./worker.service');
const { createWorkerSchema, updateWorkerSchema } = require('./worker.validation');

const sendSuccess = (res, data, message, status = 200) => {
    res.status(status).json({
        success: true,
        message,
        data
    });
};

const listWorkers = async (req, res, next) => {
    try {
        const workers = await workerService.listWorkers(req.params.slug, req.user);
        sendSuccess(res, workers, 'Workers fetched');
    } catch (error) {
        next(error);
    }
};

const createWorker = async (req, res, next) => {
    try {
        const { error, value } = createWorkerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const worker = await workerService.createWorker(req.params.slug, value, req.user);
        sendSuccess(res, worker, 'Worker created', 201);
    } catch (error) {
        next(error);
    }
};

const updateWorker = async (req, res, next) => {
    try {
        const { error, value } = updateWorkerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
            });
        }

        const worker = await workerService.updateWorker(req.params.slug, req.params.workerId, value, req.user);
        sendSuccess(res, worker, 'Worker updated');
    } catch (error) {
        next(error);
    }
};

const deleteWorker = async (req, res, next) => {
    try {
        await workerService.deleteWorker(req.params.slug, req.params.workerId, req.user);
        sendSuccess(res, null, 'Worker deleted');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listWorkers,
    createWorker,
    updateWorker,
    deleteWorker
};
