import { PrismaService } from '../prisma/prisma.service';
export declare class ServicesService {
    private prisma;
    constructor(prisma: PrismaService);
    findByBarbershop(barbershopId: string): Promise<{
        name: string;
        id: string;
        barbershopId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        durationMinutes: number;
        price: number;
    }[]>;
    create(data: any): Promise<{
        name: string;
        id: string;
        barbershopId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        durationMinutes: number;
        price: number;
    }>;
    update(id: string, data: any): Promise<{
        name: string;
        id: string;
        barbershopId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        durationMinutes: number;
        price: number;
    }>;
    delete(id: string): Promise<{
        name: string;
        id: string;
        barbershopId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        durationMinutes: number;
        price: number;
    }>;
}
