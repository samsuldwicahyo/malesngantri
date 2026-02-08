import { ServicesService } from './services.service';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    findByBarbershop(id: string): Promise<{
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
    create(body: any): Promise<{
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
    update(id: string, body: any): Promise<{
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
