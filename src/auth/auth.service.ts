import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hash },
      select: { id: true, email: true, createdAt: true },
    });

    const accessToken = this.signAccessToken(user.id, user.email);
    const refreshToken = this.signRefreshToken(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, refreshToken);

    return { user, access_token: accessToken, refresh_token: refreshToken };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.signAccessToken(user.id, user.email);
    const refreshToken = this.signRefreshToken(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, refreshToken);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refresh(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException('Invalid refresh token');

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    const accessToken = this.signAccessToken(user.id, user.email);
    const newRefreshToken = this.signRefreshToken(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, newRefreshToken);

    return { access_token: accessToken, refresh_token: newRefreshToken };
  }

  private verifyRefreshToken(token: string) {
    try {
      return this.jwt.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
      }) as { sub: string; email: string };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private signAccessToken(sub: string, email: string) {
    return this.jwt.sign({ sub, email });
  }

  private signRefreshToken(sub: string, email: string) {
    return this.jwt.sign({ sub, email }, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
      expiresIn: '30d',
    });
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: hash } });
  }
}
