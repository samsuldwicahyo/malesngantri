import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { QueuesService } from './queues.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('queues')
export class QueuesController {
  constructor(private readonly queuesService: QueuesService) {}

  @Post('join')
  join(@Body() body: any) {
    return this.queuesService.joinQueue(body);
  }

  @Patch(':id/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER, UserRole.ADMIN)
  start(@Param('id') id: string) {
    return this.queuesService.startService(id);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER, UserRole.ADMIN)
  complete(@Param('id') id: string) {
    return this.queuesService.completeService(id);
  }
}
