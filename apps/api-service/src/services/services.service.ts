import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findByBarbershop(barbershopId: string) {
    return this.prisma.service.findMany({
      where: { barbershopId, deletedAt: null },
    });
  }

  async create(data: any) {
    return this.prisma.service.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.service.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
