import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(body: any): Promise<{
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
    }>;
    login(body: any): Promise<{
        access_token: string;
        user: {
            email: any;
            sub: any;
            role: any;
            barbershopId: any;
        };
    } | {
        success: boolean;
        message: string;
    }>;
    getProfile(req: any): any;
}
