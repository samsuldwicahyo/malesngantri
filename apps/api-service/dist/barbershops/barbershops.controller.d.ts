import { BarbershopsService } from './barbershops.service';
export declare class BarbershopsController {
    private readonly barbershopsService;
    constructor(barbershopsService: BarbershopsService);
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
        settings: import("@prisma/client/runtime/library").JsonValue;
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
        settings: import("@prisma/client/runtime/library").JsonValue;
    }>;
    create(body: any): Promise<{
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
        settings: import("@prisma/client/runtime/library").JsonValue;
    }>;
    update(id: string, body: any): Promise<{
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
        settings: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
