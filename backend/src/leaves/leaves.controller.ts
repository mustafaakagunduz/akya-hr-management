import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';
import { User } from '../users/user.entity';
import { UserRole } from '../common/enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateLeaveRequestDto) {
    return this.leavesService.create(user, dto);
  }

  @Get('my')
  findMy(@CurrentUser() user: User) {
    return this.leavesService.findMy(user.id);
  }

  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateLeaveRequestDto,
  ) {
    return this.leavesService.update(user, id, dto);
  }

  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.leavesService.remove(user, id);
  }

  @Roles(UserRole.MANAGER)
  @Get('pending')
  findPending() {
    return this.leavesService.findPending();
  }

  @Roles(UserRole.MANAGER)
  @Get('history')
  findHistory() {
    return this.leavesService.findHistory();
  }

  @Roles(UserRole.MANAGER)
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.leavesService.approve(id);
  }

  @Roles(UserRole.MANAGER)
  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.leavesService.reject(id);
  }

  @Roles(UserRole.MANAGER)
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.leavesService.cancel(id);
  }
}
