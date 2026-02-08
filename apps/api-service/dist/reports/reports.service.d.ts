import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getBarbershopStats(barbershopId: string, startDate: Date, endDate: Date): Promise<{
        id: string;
        barbershopId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        date: Date;
        totalQueues: number;
        totalRevenue: number;
    }[]>;
    getBarberPerformance(barbershopId: string, barberId: string): Promise<{
        barberId: string;
        completedServices: number;
    }>;
}
