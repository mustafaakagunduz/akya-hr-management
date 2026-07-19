import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LeavesModule } from './leaves/leaves.module';
import { User } from './users/user.entity';
import { LeaveRequest } from './leaves/leave-request.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        ssl: { rejectUnauthorized: false },
        entities: [User, LeaveRequest],
        autoLoadEntities: true,
        // Demo proje için synchronize kullanılıyor; prod'da migration kullanılır.
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    LeavesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
