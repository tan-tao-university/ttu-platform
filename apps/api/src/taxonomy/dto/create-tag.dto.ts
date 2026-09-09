import { IsBoolean, IsOptional, Matches } from 'class-validator';

const CODE_PATTERN = /^[a-z0-9][a-z0-9_-]{0,99}$/;

export class CreateTagDto {
  @IsOptional()
  @Matches(CODE_PATTERN, {
    message: 'code must be lowercase alphanumeric with - or _, max 100 chars',
  })
  code?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
