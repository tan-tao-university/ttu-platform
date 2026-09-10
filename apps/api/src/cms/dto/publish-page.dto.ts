import { IsOptional, IsString, Length } from 'class-validator';

export class PublishPageDto {
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  publishNote?: string;
}
