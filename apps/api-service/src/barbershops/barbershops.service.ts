import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Barbershop, Prisma } from '@prisma/client';

@Injectable()
export class BarbershopsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.barbershop.findMany({
      where: { deletedAt: null },
    });
  }

  async findBySlug(slug: string) {
    const shop = await this.prisma.barbershop.findUnique({
      where: { slug },
      include: {
        services: true,
        barbers: {
          where: { status: 'AVAILABLE' },
        },
      },
    });
    if (!shop) throw new NotFoundException('Barbershop not found');
    return shop;
  }

  async create(data: Prisma.BarbershopCreateInput) {
    return this.prisma.barbershop.create({ data });
  }

  async update(id: string, data: Prisma.BarbershopUpdateInput) {
    return this.prisma.barbershop.update({
      where: { id },
      data,
    });
  }
}
