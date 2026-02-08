import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { BarbersService } from './barbers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, BarberStatus } from '@prisma/client';

@Controller('barbers')
export class BarbersController {
  constructor(private readonly barbersService: BarbersService) {}

  @Get('barbershop/:id')
  findByBarbershop(@Param('id') id: string) {
    return this.barbersService.findByBarbershop(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.barbersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER, UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: BarberStatus) {
    return this.barbersService.updateStatus(id, status);
  }
}
