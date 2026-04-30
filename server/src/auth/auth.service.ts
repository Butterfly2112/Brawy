import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.dto';
import crypto from 'crypto';
import { EmailService } from 'src/email/email.service';
import { LoginDto } from './dto/login.dto';
import { TokenType, User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private userService: UserService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto): Promise<void> {
    const user = await this.userService.create(dto);

    const token = await this.createEmailToken(user.id);
    this.emailService.sendEmailConfirmation(user.username, user.email, token);
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByloginOrEmail(dto.loginOrEmail);

    const isValid = user?.password_hash
      ? await this.userService.verifyPassword(dto.password, user.password_hash)
      : false;

    if (!isValid) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user!.is_email_verified) {
      throw new ForbiddenException('Please verify your email first');
    }

    return this.issueTokens(user!);
  }

  async loginWithGoogle(googleUser: {
    googleId: string;
    email: string;
    username: string;
    avatar: string;
  }) {
    let user = await this.userService.findByGoogleId(googleUser.googleId);

    if (!user) {
      const exists = await this.userService.findByloginOrEmail(
        googleUser.email,
      );

      if (exists) {
        if (!exists.google_id) {
          throw new ConflictException(
            'Account with this email exists and were registered using password. Please login with password.',
          );
        }

        user = exists;
      } else {
        const login = googleUser.email.split('@')[0] + '_' + Date.now();
        user = await this.userService.createGoogleUser({
          login,
          username: googleUser.username,
          email: googleUser.email,
          googleId: googleUser.googleId,
          avatar: googleUser.avatar,
        });
      }
    }

    return this.issueTokens(user);
  }

  async refresh(userId: number, tokenId: number) {
    const user = await this.userService.findById(userId);

    await this.prisma.token.delete({ where: { id: tokenId } });

    return this.issueTokens(user);
  }

  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) return;

    const tokenHash = this.hashToken(refreshToken);

    await this.prisma.token.deleteMany({
      where: {
        token: tokenHash,
        type: TokenType.refreshJwtToken,
      },
    });
  }

  async confirmEmail(token: string): Promise<void> {
    const record = await this.prisma.token.findUnique({ where: { token } });

    if (!record || record.type !== TokenType.emailChange) {
      throw new ConflictException('Invalid token');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.user_id },
        data: { is_email_verified: true },
      }),
      this.prisma.token.delete({ where: { id: record.id } }),
    ]);
  }

  async createEmailToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.token.create({
      data: { type: 'emailChange', token, user_id: userId },
    });
    return token;
  }

  private async issueTokens(user: User) {
    const payload = {
      sub: user.id,
      login: user.login,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    const tokenHash = this.hashToken(refreshToken);

    await this.prisma.token.deleteMany({
      where: {
        user_id: user.id,
        type: 'refreshJwtToken',
        expires_at: { lt: new Date() },
      },
    });

    await this.prisma.token.create({
      data: {
        type: 'refreshJwtToken',
        token: tokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        user_id: user.id,
      },
    });

    const { password_hash, ...safeUser } = user;

    return { accessToken, refreshToken, user: safeUser };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
