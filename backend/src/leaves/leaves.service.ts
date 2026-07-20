import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LeaveRequest } from './leave-request.entity';
import { User } from '../users/user.entity';
import { LeaveStatus, LeaveType } from '../common/enums';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { LeavesGateway } from './leaves.gateway';

function toUtcDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function countDays(startDate: string, endDate: string): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const diff = toUtcDate(endDate).getTime() - toUtcDate(startDate).getTime();
  return Math.round(diff / MS_PER_DAY) + 1;
}

@Injectable()
export class LeavesService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
    private readonly dataSource: DataSource,
    private readonly leavesGateway: LeavesGateway,
  ) {}

  private async validateDatesAndOverlap(
    userId: string,
    type: LeaveType,
    startDate: string,
    endDate: string,
    balance: number,
    excludeId?: string,
  ): Promise<number> {
    if (toUtcDate(endDate) < toUtcDate(startDate)) {
      throw new BadRequestException(
        'Bitiş tarihi başlangıç tarihinden önce olamaz',
      );
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (toUtcDate(startDate) < today) {
      throw new BadRequestException('Geçmiş tarihe izin talebi girilemez');
    }

    const dayCount = countDays(startDate, endDate);

    const overlapQuery = this.leaveRequestRepository
      .createQueryBuilder('leaveRequest')
      .where('leaveRequest.userId = :userId', { userId })
      .andWhere('leaveRequest.status IN (:...statuses)', {
        statuses: [LeaveStatus.PENDING, LeaveStatus.APPROVED],
      })
      .andWhere('leaveRequest.startDate <= :endDate', { endDate })
      .andWhere('leaveRequest.endDate >= :startDate', { startDate });

    if (excludeId) {
      overlapQuery.andWhere('leaveRequest.id != :excludeId', { excludeId });
    }

    const overlapping = await overlapQuery.getOne();

    if (overlapping) {
      throw new BadRequestException(
        'Bu tarih aralığında bekleyen veya onaylanmış bir talebiniz zaten var',
      );
    }

    if (type === LeaveType.ANNUAL && dayCount > balance) {
      throw new BadRequestException('Yıllık izin bakiyeniz yetersiz');
    }

    return dayCount;
  }

  async create(user: User, dto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const { type, startDate, endDate, description } = dto;

    const dayCount = await this.validateDatesAndOverlap(
      user.id,
      type,
      startDate,
      endDate,
      user.annualLeaveBalance,
    );

    const leaveRequest = this.leaveRequestRepository.create({
      userId: user.id,
      user,
      type,
      startDate,
      endDate,
      dayCount,
      description,
    });

    const saved = await this.leaveRequestRepository.save(leaveRequest);
    delete (saved.user as { password?: string }).password;
    this.leavesGateway.notifyManagersOfNewRequest(saved);
    return saved;
  }

  async update(
    user: User,
    id: string,
    dto: UpdateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id },
      relations: { user: true },
      select: {
        user: {
          id: true,
          firstName: true,
          lastName: true,
          department: true,
          position: true,
        },
      },
    });
    if (!leaveRequest) {
      throw new NotFoundException('İzin talebi bulunamadı');
    }
    if (leaveRequest.userId !== user.id) {
      throw new ForbiddenException('Bu izin talebini düzenleme yetkiniz yok');
    }
    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Sadece bekleyen talepler düzenlenebilir');
    }

    const { type, startDate, endDate, description } = dto;
    const dayCount = await this.validateDatesAndOverlap(
      user.id,
      type,
      startDate,
      endDate,
      user.annualLeaveBalance,
      id,
    );

    leaveRequest.type = type;
    leaveRequest.startDate = startDate;
    leaveRequest.endDate = endDate;
    leaveRequest.dayCount = dayCount;
    leaveRequest.description = description ?? null;

    const saved = await this.leaveRequestRepository.save(leaveRequest);
    this.leavesGateway.notifyManagersOfLeaveEdit(saved);
    return saved;
  }

  async remove(user: User, id: string): Promise<void> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id },
    });
    if (!leaveRequest) {
      throw new NotFoundException('İzin talebi bulunamadı');
    }
    if (leaveRequest.userId !== user.id) {
      throw new ForbiddenException('Bu izin talebini silme yetkiniz yok');
    }
    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Sadece bekleyen talepler silinebilir');
    }

    await this.leaveRequestRepository.remove(leaveRequest);
    this.leavesGateway.notifyManagersOfLeaveDeletion(id);
  }

  findMy(userId: string): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  findPending(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      where: { status: LeaveStatus.PENDING },
      relations: { user: true },
      select: {
        user: {
          id: true,
          firstName: true,
          lastName: true,
          department: true,
          position: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  findHistory(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      where: [
        { status: LeaveStatus.APPROVED },
        { status: LeaveStatus.REJECTED },
      ],
      relations: { user: true },
      select: {
        user: {
          id: true,
          firstName: true,
          lastName: true,
          department: true,
          position: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async approve(id: string): Promise<LeaveRequest> {
    const saved = await this.dataSource.transaction(async (manager) => {
      const leaveRequest = await manager.findOne(LeaveRequest, {
        where: { id },
        relations: { user: true },
      });
      if (!leaveRequest) {
        throw new BadRequestException('İzin talebi bulunamadı');
      }
      if (leaveRequest.status !== LeaveStatus.PENDING) {
        throw new BadRequestException(
          'Sadece bekleyen talepler onaylanabilir',
        );
      }

      if (leaveRequest.type === LeaveType.ANNUAL) {
        if (leaveRequest.dayCount > leaveRequest.user.annualLeaveBalance) {
          throw new BadRequestException('Yıllık izin bakiyesi yetersiz');
        }
        leaveRequest.user.annualLeaveBalance -= leaveRequest.dayCount;
        await manager.save(User, leaveRequest.user);
      }

      leaveRequest.status = LeaveStatus.APPROVED;
      return manager.save(LeaveRequest, leaveRequest);
    });
    delete (saved.user as { password?: string }).password;
    this.leavesGateway.notifyUserOfDecision(saved.userId, saved);
    return saved;
  }

  async reject(id: string): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id },
    });
    if (!leaveRequest) {
      throw new BadRequestException('İzin talebi bulunamadı');
    }
    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Sadece bekleyen talepler reddedilebilir');
    }

    leaveRequest.status = LeaveStatus.REJECTED;
    const saved = await this.leaveRequestRepository.save(leaveRequest);
    this.leavesGateway.notifyUserOfDecision(saved.userId, saved);
    return saved;
  }
}
