import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class BarbershopsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        address: string | null;
        logoUrl: string | null;
        timezone: string;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        settings: Prisma.JsonValue;
    }[]>;
    findBySlug(slug: string): Promise<{
        barbers: {
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
        }[];
        services: {
            name: string;
            id: string;
            barbershopId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            durationMinutes: number;
            price: number;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        address: string | null;
        logoUrl: string | null;
        timezone: string;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        settings: Prisma.JsonValue;
    }>;
    create(data: Prisma.BarbershopCreateInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        address: string | null;
        logoUrl: string | null;
        timezone: string;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        settings: Prisma.JsonValue;
    }>;
    update(id: string, data: Prisma.BarbershopUpdateInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        address: string | null;
        logoUrl: string | null;
        timezone: string;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        settings: Prisma.JsonValue;
    }>;
}
