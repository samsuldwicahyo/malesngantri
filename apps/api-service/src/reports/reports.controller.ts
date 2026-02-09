import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('barbershop/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getStats(
    @Param('id') id: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.reportsService.getBarbershopStats(
      id,
      new Date(start),
      new Date(end),
    );
  }

  @Get('barber/:id/performance')
  @Roles(UserRole.ADMIN, UserRole.BARBER)
  getPerformance(
    @Param('id') id: string,
    @Query('barbershopId') barbershopId: string,
  ) {
    return this.reportsService.getBarberPerformance(barbershopId, id);
  }
}
