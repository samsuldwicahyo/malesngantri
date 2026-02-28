const QueueStatus = Object.freeze({
    BOOKED: 'BOOKED',
    CHECKED_IN: 'CHECKED_IN',
    IN_SERVICE: 'IN_SERVICE',
    DONE: 'DONE',
    CANCELED: 'CANCELED',
    NO_SHOW: 'NO_SHOW'
});

const ALLOWED_TRANSITIONS = Object.freeze({
    [QueueStatus.BOOKED]: [QueueStatus.CHECKED_IN, QueueStatus.CANCELED, QueueStatus.NO_SHOW],
    [QueueStatus.CHECKED_IN]: [QueueStatus.IN_SERVICE, QueueStatus.CANCELED, QueueStatus.NO_SHOW],
    [QueueStatus.IN_SERVICE]: [QueueStatus.DONE],
    [QueueStatus.DONE]: [],
    [QueueStatus.CANCELED]: [],
    [QueueStatus.NO_SHOW]: []
});

const canTransition = (from, to) => {
    if (!from || !to) return false;
    if (!Object.values(QueueStatus).includes(from)) return false;
    if (!Object.values(QueueStatus).includes(to)) return false;
    return ALLOWED_TRANSITIONS[from].includes(to);
};

const isActiveQueueStatus = (status) => {
    return [QueueStatus.BOOKED, QueueStatus.CHECKED_IN, QueueStatus.IN_SERVICE].includes(status);
};

module.exports = {
    QueueStatus,
    ALLOWED_TRANSITIONS,
    canTransition,
    isActiveQueueStatus
};
