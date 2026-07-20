import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Department, Position } from '../../common/enums';

export class UpdateProfileDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girin' })
  email: string;

  @IsNotEmpty({ message: 'Telefon boş bırakılamaz' })
  phone: string;

  @IsEnum(Department, { message: 'Geçerli bir departman seçin' })
  department: Department;

  @IsEnum(Position, { message: 'Geçerli bir pozisyon seçin' })
  position: Position;
}
