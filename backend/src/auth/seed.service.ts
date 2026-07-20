import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { LeaveRequest } from '../leaves/leave-request.entity';
import {
  Department,
  LeaveStatus,
  LeaveType,
  Position,
  UserRole,
} from '../common/enums';

const SALT_ROUNDS = 10;

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
  ) {}

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
    await this.seedLeaveRequests();
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

  private async seedLeaveRequests() {
    const existingCount = await this.leaveRequestRepository.count();
    if (existingCount > 0) {
      return;
    }

    const requestsByEmail: Record<
      string,
      Array<{
        type: LeaveType;
        startDate: string;
        endDate: string;
        dayCount: number;
        description: string;
        status: LeaveStatus;
      }>
    > = {
      'ayse.yilmaz@sirket.com': [
        {
          type: LeaveType.ANNUAL,
          startDate: '2026-08-10',
          endDate: '2026-08-14',
          dayCount: 5,
          description: 'Yaz tatili',
          status: LeaveStatus.PENDING,
        },
        {
          type: LeaveType.DAILY,
          startDate: '2026-06-02',
          endDate: '2026-06-02',
          dayCount: 1,
          description: 'Doktor randevusu',
          status: LeaveStatus.APPROVED,
        },
        {
          type: LeaveType.ANNUAL,
          startDate: '2026-05-05',
          endDate: '2026-05-07',
          dayCount: 3,
          description: 'Aile ziyareti',
          status: LeaveStatus.APPROVED,
        },
        {
          type: LeaveType.DAILY,
          startDate: '2026-06-20',
          endDate: '2026-06-20',
          dayCount: 1,
          description: 'Kişisel işler',
          status: LeaveStatus.REJECTED,
        },
      ],
      'mehmet.demir@sirket.com': [
        {
          type: LeaveType.DAILY,
          startDate: '2026-07-28',
          endDate: '2026-07-28',
          dayCount: 1,
          description: 'Taşınma',
          status: LeaveStatus.PENDING,
        },
        {
          type: LeaveType.ANNUAL,
          startDate: '2026-09-01',
          endDate: '2026-09-03',
          dayCount: 3,
          description: 'Düğün',
          status: LeaveStatus.PENDING,
        },
        {
          type: LeaveType.ANNUAL,
          startDate: '2026-04-01',
          endDate: '2026-04-10',
          dayCount: 10,
          description: 'Yıllık izin',
          status: LeaveStatus.APPROVED,
        },
      ],
      'elif.kaya@sirket.com': [
        {
          type: LeaveType.DAILY,
          startDate: '2026-08-05',
          endDate: '2026-08-05',
          dayCount: 1,
          description: 'Kişisel işler',
          status: LeaveStatus.PENDING,
        },
        {
          type: LeaveType.DAILY,
          startDate: '2026-06-15',
          endDate: '2026-06-15',
          dayCount: 1,
          description: 'Sağlık kontrolü',
          status: LeaveStatus.APPROVED,
        },
        {
          type: LeaveType.ANNUAL,
          startDate: '2026-07-01',
          endDate: '2026-07-05',
          dayCount: 5,
          description: 'Tatil planı',
          status: LeaveStatus.REJECTED,
        },
        {
          type: LeaveType.ANNUAL,
          startDate: '2026-03-01',
          endDate: '2026-03-03',
          dayCount: 3,
          description: 'İptal edilen izin',
          status: LeaveStatus.CANCELLED,
        },
      ],
    };

    for (const [email, requests] of Object.entries(requestsByEmail)) {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        continue;
      }

      let approvedAnnualDays = 0;
      for (const request of requests) {
        await this.leaveRequestRepository.save(
          this.leaveRequestRepository.create({
            userId: user.id,
            ...request,
          }),
        );
        if (
          request.status === LeaveStatus.APPROVED &&
          request.type === LeaveType.ANNUAL
        ) {
          approvedAnnualDays += request.dayCount;
        }
      }

      if (approvedAnnualDays > 0) {
        user.annualLeaveBalance = Math.max(
          0,
          user.annualLeaveBalance - approvedAnnualDays,
        );
        await this.userRepository.save(user);
      }

      this.logger.log(`Demo izin talepleri oluşturuldu: ${email}`);
    }
  }
}
