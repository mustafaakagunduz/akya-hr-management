import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest } from './leave-request.entity';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest])],
  controllers: [LeavesController],
  providers: [LeavesService],
})
export class LeavesModule {}
