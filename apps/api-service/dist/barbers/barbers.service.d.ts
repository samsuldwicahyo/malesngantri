import { PrismaService } from '../prisma/prisma.service';
import { BarberStatus } from '@prisma/client';
export declare class BarbersService {
    private prisma;
    constructor(prisma: PrismaService);
    findByBarbershop(barbershopId: string): Promise<({
        user: {
            id: string;
            barbershopId: string | null;
            fullName: string;
            email: string;
            phoneNumber: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            fcmToken: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
    } & {
        id: string;
        barbershopId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.BarberStatus;
        displayName: string | null;
        specialization: string | null;
        commissionRate: number | null;
        userId: string;
    })[]>;
    updateStatus(id: string, status: BarberStatus): Promise<{
        id: string;
        barbershopId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.BarberStatus;
        displayName: string | null;
        specialization: string | null;
        commissionRate: number | null;
        userId: string;
    }>;
    create(data: any): Promise<{
        id: string;
        barbershopId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.BarberStatus;
        displayName: string | null;
        specialization: string | null;
        commissionRate: number | null;
        userId: string;
    }>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            barbershopId: string | null;
            fullName: string;
            email: string;
            phoneNumber: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            fcmToken: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
        services: ({
            service: {
                name: string;
                id: string;
                barbershopId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                durationMinutes: number;
                price: number;
            };
        } & {
            barberId: string;
            serviceId: string;
            customDurationMinutes: number | null;
        })[];
    } & {
        id: string;
        barbershopId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.BarberStatus;
        displayName: string | null;
        specialization: string | null;
        commissionRate: number | null;
        userId: string;
    }>;
}
