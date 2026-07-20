import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  findByNationalId(nationalId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { nationalId } });
  }

  findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  count(): Promise<number> {
    return this.userRepository.count();
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { createdAt: 'DESC' } });
  }

  async updateProfile(user: User, dto: UpdateProfileDto): Promise<User> {
    if (dto.email !== user.email) {
      const existing = await this.findByEmail(dto.email);
      if (existing) {
        throw new BadRequestException('Bu e-posta adresi zaten kullanılıyor');
      }
    }

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async changePassword(user: User, dto: ChangePasswordDto): Promise<void> {
    const passwordMatches = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!passwordMatches) {
      throw new BadRequestException('Mevcut şifre hatalı');
    }

    user.password = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.userRepository.save(user);
  }

  async resetPassword(id: string): Promise<string> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const newPassword = String(Math.floor(100000 + Math.random() * 900000));
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepository.save(user);

    return newPassword;
  }

  async resetAnnualLeaveBalance(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    user.annualLeaveBalance = user.defaultAnnualLeaveBalance;
    return this.userRepository.save(user);
  }

  async adminUpdateUser(id: string, dto: AdminUpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    if (dto.email !== user.email) {
      const existingEmail = await this.findByEmail(dto.email);
      if (existingEmail) {
        throw new BadRequestException('Bu e-posta adresi zaten kullanılıyor');
      }
    }

    if (dto.nationalId !== user.nationalId) {
      const existingNationalId = await this.findByNationalId(dto.nationalId);
      if (existingNationalId) {
        throw new BadRequestException('Bu TC Kimlik No zaten kayıtlı');
      }
    }

    const { annualLeaveBalance: newDefaultBalance, ...rest } = dto;
    const balanceDelta = newDefaultBalance - user.defaultAnnualLeaveBalance;

    Object.assign(user, rest);
    user.defaultAnnualLeaveBalance = newDefaultBalance;
    user.annualLeaveBalance = Math.max(
      0,
      user.annualLeaveBalance + balanceDelta,
    );
    return this.userRepository.save(user);
  }

  async setActive(id: string, isActive: boolean): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    user.isActive = isActive;
    return this.userRepository.save(user);
  }
}
