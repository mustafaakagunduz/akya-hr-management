import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Department, Position, UserRole } from '../common/enums';

const SALT_ROUNDS = 10;

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    const existingAdmin = await this.usersService.findByEmail(
      'admin@sirket.com',
    );
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin123!', SALT_ROUNDS);
      await this.usersService.create({
        firstName: 'Sistem',
        lastName: 'Yöneticisi',
        nationalId: '00000000000',
        email: 'admin@sirket.com',
        phone: '0000000000',
        department: Department.HR,
        position: Position.DIRECTOR,
        startDate: new Date().toISOString().slice(0, 10),
        birthDate: '1990-01-01',
        password: hashedPassword,
        role: UserRole.MANAGER,
      });

      this.logger.log(
        'Demo yönetici hesabı oluşturuldu: admin@sirket.com / Admin123!',
      );
    }

    await this.seedEmployees();
  }

  private async seedEmployees() {
    const employees = [
      {
        firstName: 'Ayşe',
        lastName: 'Yılmaz',
        nationalId: '10000000001',
        email: 'ayse.yilmaz@sirket.com',
        phone: '5551000001',
        department: Department.HR,
        position: Position.SPECIALIST,
        startDate: '2022-03-01',
        birthDate: '1994-05-12',
      },
      {
        firstName: 'Mehmet',
        lastName: 'Demir',
        nationalId: '10000000002',
        email: 'mehmet.demir@sirket.com',
        phone: '5551000002',
        department: Department.SOFTWARE,
        position: Position.SPECIALIST,
        startDate: '2021-07-15',
        birthDate: '1992-11-03',
      },
      {
        firstName: 'Elif',
        lastName: 'Kaya',
        nationalId: '10000000003',
        email: 'elif.kaya@sirket.com',
        phone: '5551000003',
        department: Department.FINANCE,
        position: Position.SPECIALIST,
        startDate: '2023-01-10',
        birthDate: '1996-02-20',
      },
    ];

    for (const employee of employees) {
      const existing = await this.usersService.findByEmail(employee.email);
      if (existing) {
        continue;
      }

      const hashedPassword = await bcrypt.hash('Personel123!', SALT_ROUNDS);
      await this.usersService.create({
        ...employee,
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
      });

      this.logger.log(`Demo personel hesabı oluşturuldu: ${employee.email}`);
    }
  }
}
