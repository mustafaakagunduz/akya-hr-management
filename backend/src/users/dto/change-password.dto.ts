import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Mevcut şifre boş bırakılamaz' })
  currentPassword: string;

  @MinLength(6, { message: 'Yeni şifre en az 6 karakter olmalı' })
  newPassword: string;
}
