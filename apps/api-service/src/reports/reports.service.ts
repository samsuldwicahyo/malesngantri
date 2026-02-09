import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getBarbershopStats(
    barbershopId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return this.prisma.analyticsDaily.findMany({
      where: {
        barbershopId,
        date: { gte: startDate, lte: endDate },
      },
    });
  }

  async getBarberPerformance(barbershopId: string, barberId: string) {
    // Basic aggregation: count completed queues
    const count = await this.prisma.queue.count({
      where: {
        barberId,
        status: 'COMPLETED',
      },
    });
    return { barberId, completedServices: count };
  }
}
