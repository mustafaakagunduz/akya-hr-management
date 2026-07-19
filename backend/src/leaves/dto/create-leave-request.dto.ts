import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { LeaveType } from '../../common/enums';

export class CreateLeaveRequestDto {
  @IsEnum(LeaveType, { message: 'İzin türü GUNLUK veya YILLIK olmalı' })
  type: LeaveType;

  @IsDateString({}, { message: 'Başlangıç tarihi geçerli bir tarih olmalı' })
  startDate: string;

  @IsDateString({}, { message: 'Bitiş tarihi geçerli bir tarih olmalı' })
  endDate: string;

  @IsOptional()
  @IsString()
  description?: string;
}
