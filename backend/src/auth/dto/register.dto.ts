import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  Length,
  MinLength,
} from 'class-validator';
import { Department, Position } from '../../common/enums';

export class RegisterDto {
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

  @MinLength(6, { message: 'Şifre en az 6 karakter olmalı' })
  password: string;
}
