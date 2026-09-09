import { IsIn, IsOptional, IsUUID, Length } from 'class-validator';
import {
  CONTENT_TYPES,
  EDITORIAL_STATUSES,
  type ContentType,
  type EditorialStatus,
} from '../../db/schema';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class AdminContentListQueryDto extends PaginationQueryDto {
  @Length(2, 16)
  locale!: string;

  @IsOptional()
  @IsIn(CONTENT_TYPES)
  type?: ContentType;

  @IsOptional()
  @IsIn(EDITORIAL_STATUSES)
  status?: EditorialStatus;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
