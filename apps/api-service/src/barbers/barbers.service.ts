import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BarberStatus } from '@prisma/client';

@Injectable()
export class BarbersService {
  constructor(private prisma: PrismaService) {}

  async findByBarbershop(barbershopId: string) {
    return this.prisma.barber.findMany({
      where: { barbershopId, deletedAt: null },
      include: { user: true },
    });
  }

  async updateStatus(id: string, status: BarberStatus) {
    return this.prisma.barber.update({
      where: { id },
      data: { status },
    });
  }

  async create(data: any) {
    return this.prisma.barber.create({ data });
  }

  async findOne(id: string) {
    const barber = await this.prisma.barber.findUnique({
      where: { id },
      include: { user: true, services: { include: { service: true } } },
    });
    if (!barber) throw new NotFoundException('Barber not found');
    return barber;
  }
}
