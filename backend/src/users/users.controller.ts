import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';
import { User } from './user.entity';
import { UserRole } from '../common/enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.MANAGER)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(({ password, ...result }) => result);
  }

  @Roles(UserRole.MANAGER)
  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string) {
    const newPassword = await this.usersService.resetPassword(id);
    return { newPassword };
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    const updated = await this.usersService.updateProfile(user, dto);
    const { password, ...result } = updated;
    return result;
  }

  @Patch('me/password')
  async changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(user, dto);
    return { success: true };
  }
}
