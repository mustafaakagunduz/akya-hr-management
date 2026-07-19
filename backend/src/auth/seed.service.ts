import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums';

const SALT_ROUNDS = 10;

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    const existingAdmin = await this.usersService.findByEmail(
      'admin@sirket.com',
    );
    if (existingAdmin) {
      return;
    }

    const hashedPassword = await bcrypt.hash('Admin123!', SALT_ROUNDS);
    await this.usersService.create({
      firstName: 'Sistem',
      lastName: 'Yöneticisi',
      nationalId: '00000000000',
      email: 'admin@sirket.com',
      phone: '0000000000',
      department: 'Yönetim',
      position: 'Yönetici',
      startDate: new Date().toISOString().slice(0, 10),
      birthDate: '1990-01-01',
      password: hashedPassword,
      role: UserRole.MANAGER,
    });

    this.logger.log(
      'Demo yönetici hesabı oluşturuldu: admin@sirket.com / Admin123!',
    );
  }
}
