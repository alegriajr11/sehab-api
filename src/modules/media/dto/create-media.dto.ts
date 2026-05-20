import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { MediaOwnerTypeEnum } from '../../../common/enums';

export class CreateMediaDto {
  @IsEnum(MediaOwnerTypeEnum)
  ownerType: MediaOwnerTypeEnum;

  @IsNumber()
  @IsPositive()
  ownerId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  url: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  filename: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  mimeType: string;

  @IsNumber()
  @IsOptional()
  size?: number;

  @IsString()
  @IsOptional()
  @MaxLength(64)
  checksum?: string | null;
}
