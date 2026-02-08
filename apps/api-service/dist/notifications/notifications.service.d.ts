import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(receipientPhone: string): Promise<never[]>;
    logNotification(data: any): Promise<{
        success: boolean;
    }>;
}
