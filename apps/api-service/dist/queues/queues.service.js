"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueuesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let QueuesService = class QueuesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async joinQueue(data) {
        const service = await this.prisma.service.findUnique({
            where: { id: data.serviceId },
        });
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        const lastQueue = await this.prisma.queue.findFirst({
            where: {
                barberId: data.barberId,
                status: {
                    in: [
                        client_1.QueueStatus.WAITING,
                        client_1.QueueStatus.IN_PROGRESS,
                        client_1.QueueStatus.CALLED,
                    ],
                },
            },
            orderBy: { estimatedEndTime: 'desc' },
        });
        let startTime = new Date();
        if (lastQueue && lastQueue.estimatedEndTime) {
            startTime = new Date(Math.max(Date.now(), lastQueue.estimatedEndTime.getTime()));
        }
        const estimatedEndTime = new Date(startTime.getTime() + service.durationMinutes * 60000);
        return this.prisma.queue.create({
            data: {
                ...data,
                estimatedStartTime: startTime,
                estimatedEndTime: estimatedEndTime,
                status: client_1.QueueStatus.WAITING,
            },
        });
    }
    async startService(queueId) {
        const queue = await this.prisma.queue.findUnique({
            where: { id: queueId },
        });
        if (!queue)
            throw new common_1.NotFoundException('Queue not found');
        const updated = await this.prisma.queue.update({
            where: { id: queueId },
            data: {
                status: client_1.QueueStatus.IN_PROGRESS,
                actualStartTime: new Date(),
            },
        });
        await this.recalculateBarberQueues(queue.barberId);
        return updated;
    }
    async completeService(queueId) {
        const updated = await this.prisma.queue.update({
            where: { id: queueId },
            data: {
                status: client_1.QueueStatus.COMPLETED,
                actualEndTime: new Date(),
            },
        });
        await this.recalculateBarberQueues(updated.barberId);
        return updated;
    }
    async recalculateBarberQueues(barberId) {
        if (!barberId)
            return;
        const activeQueues = await this.prisma.queue.findMany({
            where: {
                barberId,
                status: {
                    in: [
                        client_1.QueueStatus.WAITING,
                        client_1.QueueStatus.CALLED,
                        client_1.QueueStatus.IN_PROGRESS,
                    ],
                },
            },
            include: { service: true },
            orderBy: { estimatedStartTime: 'asc' },
        });
        let timeline = new Date();
        const inProgress = activeQueues.find((q) => q.status === client_1.QueueStatus.IN_PROGRESS);
        if (inProgress && inProgress.actualStartTime) {
            timeline = new Date(inProgress.actualStartTime.getTime() +
                inProgress.service.durationMinutes * 60000);
            await this.prisma.queue.update({
                where: { id: inProgress.id },
                data: { estimatedEndTime: timeline },
            });
        }
        for (const q of activeQueues) {
            if (q.status === client_1.QueueStatus.IN_PROGRESS)
                continue;
            const estimatedStart = timeline;
            const estimatedEnd = new Date(estimatedStart.getTime() + q.service.durationMinutes * 60000);
            await this.prisma.queue.update({
                where: { id: q.id },
                data: {
                    estimatedStartTime: estimatedStart,
                    estimatedEndTime: estimatedEnd,
                },
            });
            timeline = estimatedEnd;
        }
    }
};
exports.QueuesService = QueuesService;
exports.QueuesService = QueuesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QueuesService);
//# sourceMappingURL=queues.service.js.map