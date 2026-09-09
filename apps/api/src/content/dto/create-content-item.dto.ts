import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { CONTENT_TYPES, type ContentType } from '../../db/schema';

export class CreateContentItemDto {
  @IsIn(CONTENT_TYPES)
  type!: ContentType;

  @IsOptional()
  @IsUUID()
  featuredMediaId?: string;
}
