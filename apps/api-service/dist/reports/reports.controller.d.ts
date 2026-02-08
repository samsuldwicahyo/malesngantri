import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getStats(id: string, start: string, end: string): Promise<{
        id: string;
        barbershopId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        date: Date;
        totalQueues: number;
        totalRevenue: number;
    }[]>;
    getPerformance(id: string, barbershopId: string): Promise<{
        barberId: string;
        completedServices: number;
    }>;
}
