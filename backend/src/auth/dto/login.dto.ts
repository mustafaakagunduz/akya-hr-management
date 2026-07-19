import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girin' })
  email: string;

  @IsNotEmpty({ message: 'Şifre boş bırakılamaz' })
  password: string;
}
