import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueStatus } from '@prisma/client';

@Injectable()
export class QueuesService {
  constructor(private prisma: PrismaService) {}

  async joinQueue(data: {
    barbershopId: string;
    barberId?: string;
    serviceId: string;
    customerId?: string;
    guestName?: string;
  }) {
    const service = await this.prisma.service.findUnique({
      where: { id: data.serviceId },
    });
    if (!service) throw new NotFoundException('Service not found');

    // Basic logic: Find last estimated end time for this barber
    const lastQueue = await this.prisma.queue.findFirst({
      where: {
        barberId: data.barberId,
        status: {
          in: [
            QueueStatus.WAITING,
            QueueStatus.IN_PROGRESS,
            QueueStatus.CALLED,
          ],
        },
      },
      orderBy: { estimatedEndTime: 'desc' },
    });

    let startTime = new Date();
    if (lastQueue && lastQueue.estimatedEndTime) {
      startTime = new Date(
        Math.max(Date.now(), lastQueue.estimatedEndTime.getTime()),
      );
    }

    const estimatedEndTime = new Date(
      startTime.getTime() + service.durationMinutes * 60000,
    );

    return this.prisma.queue.create({
      data: {
        ...data,
        estimatedStartTime: startTime,
        estimatedEndTime: estimatedEndTime,
        status: QueueStatus.WAITING,
      },
    });
  }

  async startService(queueId: string) {
    const queue = await this.prisma.queue.findUnique({
      where: { id: queueId },
    });
    if (!queue) throw new NotFoundException('Queue not found');

    const updated = await this.prisma.queue.update({
      where: { id: queueId },
      data: {
        status: QueueStatus.IN_PROGRESS,
        actualStartTime: new Date(),
      },
    });

    // Strategy: Recalculate subsequent queues for this barber
    await this.recalculateBarberQueues(queue.barberId);
    return updated;
  }

  async completeService(queueId: string) {
    const updated = await this.prisma.queue.update({
      where: { id: queueId },
      data: {
        status: QueueStatus.COMPLETED,
        actualEndTime: new Date(),
      },
    });

    await this.recalculateBarberQueues(updated.barberId);
    return updated;
  }

  private async recalculateBarberQueues(barberId: string | null) {
    if (!barberId) return;

    const activeQueues = await this.prisma.queue.findMany({
      where: {
        barberId,
        status: {
          in: [
            QueueStatus.WAITING,
            QueueStatus.CALLED,
            QueueStatus.IN_PROGRESS,
          ],
        },
      },
      include: { service: true },
      orderBy: { estimatedStartTime: 'asc' },
    });

    let timeline = new Date();

    // If one is IN_PROGRESS, use its estimated end based on start time + duration
    const inProgress = activeQueues.find(
      (q) => q.status === QueueStatus.IN_PROGRESS,
    );
    if (inProgress && inProgress.actualStartTime) {
      timeline = new Date(
        inProgress.actualStartTime.getTime() +
          inProgress.service.durationMinutes * 60000,
      );
      // Update inProgress estimated end just in case
      await this.prisma.queue.update({
        where: { id: inProgress.id },
        data: { estimatedEndTime: timeline },
      });
    }

    // Update WAITING queues
    for (const q of activeQueues) {
      if (q.status === QueueStatus.IN_PROGRESS) continue;

      const estimatedStart = timeline;
      const estimatedEnd = new Date(
        estimatedStart.getTime() + q.service.durationMinutes * 60000,
      );

      await this.prisma.queue.update({
        where: { id: q.id },
        data: {
          estimatedStartTime: estimatedStart,
          estimatedEndTime: estimatedEnd,
        },
      });

      timeline = estimatedEnd; // Next one starts here
    }
  }
}
