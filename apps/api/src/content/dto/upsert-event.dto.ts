import { IsBoolean, IsDateString, IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class UpsertEventDto {
  @IsDateString()
  startAt!: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  timezone?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  locationName?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  locationUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  registrationUrl?: string;

  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;
}
