import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTagDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
