import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Department, Position, UserRole } from '../common/enums';
import { LeaveRequest } from '../leaves/leave-request.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true, length: 11 })
  nationalId: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'enum', enum: Department })
  department: Department;

  @Column({ type: 'enum', enum: Position })
  position: Position;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  birthDate: string;

  // Veritabanına sadece bcrypt hash olarak yazılır
  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole;

  @Column({ type: 'int', default: 14 })
  annualLeaveBalance: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.user)
  leaveRequests: LeaveRequest[];
}
