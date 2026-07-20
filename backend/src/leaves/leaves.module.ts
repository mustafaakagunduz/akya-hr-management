import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest } from './leave-request.entity';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { LeavesGateway } from './leaves.gateway';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest]), AuthModule, UsersModule],
  controllers: [LeavesController],
  providers: [LeavesService, LeavesGateway],
})
export class LeavesModule {}
