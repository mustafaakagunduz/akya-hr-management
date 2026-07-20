import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  Length,
  Min,
} from 'class-validator';
import { Department, Position, UserRole } from '../../common/enums';

export class AdminUpdateUserDto {
  @IsNotEmpty({ message: 'Ad boş bırakılamaz' })
  firstName: string;

  @IsNotEmpty({ message: 'Soyad boş bırakılamaz' })
  lastName: string;

  @Length(11, 11, { message: 'TC Kimlik No 11 haneli olmalı' })
  nationalId: string;

  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girin' })
  email: string;

  @IsNotEmpty({ message: 'Telefon boş bırakılamaz' })
  phone: string;

  @IsEnum(Department, { message: 'Geçerli bir departman seçin' })
  department: Department;

  @IsEnum(Position, { message: 'Geçerli bir pozisyon seçin' })
  position: Position;

  @IsDateString({}, { message: 'İşe başlama tarihi geçerli bir tarih olmalı' })
  startDate: string;

  @IsDateString({}, { message: 'Doğum tarihi geçerli bir tarih olmalı' })
  birthDate: string;

  @IsEnum(UserRole, { message: 'Geçerli bir rol seçin' })
  role: UserRole;

  @IsInt({ message: 'Yıllık izin bakiyesi tam sayı olmalı' })
  @Min(0, { message: 'Yıllık izin bakiyesi negatif olamaz' })
  annualLeaveBalance: number;
}
