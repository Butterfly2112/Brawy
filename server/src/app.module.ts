import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ErrorFilter } from './common/error.filter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { UploadModule } from './upload/upload.module';
import { ProjectModule } from './project/project.module';
import { FontModule } from './font/font.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60 * 1000,
        limit: 200,
      },
      {
        name: 'verySmall',
        ttl: 60 * 1000,
        limit: 5,
      },
      {
        name: 'small',
        ttl: 60 * 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 60 * 1000,
        limit: 30,
      },
      {
        name: 'big',
        ttl: 60 * 1000,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    AuthModule,
    UserModule,
    EmailModule,
    UploadModule,
    ProjectModule,
    FontModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
