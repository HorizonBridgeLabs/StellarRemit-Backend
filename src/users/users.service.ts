import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id }, select: { id: true, email: true, createdAt: true } });
  }

  async update(id: string, dto: UpdateUserDto) {
    if (dto.email) {
      const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (exists && exists.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    const data: any = {};
    if (dto.email) data.email = dto.email;
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, createdAt: true },
    });
  }

  softDelete(id: string) {
    return this.prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
