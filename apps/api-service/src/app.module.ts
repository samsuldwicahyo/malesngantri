import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BarbershopsModule } from './barbershops/barbershops.module';
import { QueuesModule } from './queues/queues.module';
import { ServicesModule } from './services/services.module';
import { BarbersModule } from './barbers/barbers.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    BarbershopsModule,
    QueuesModule,
    ServicesModule,
    BarbersModule,
    ReportsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
