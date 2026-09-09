import { IsIn, IsOptional, Length } from 'class-validator';
import { CONTENT_TYPES, type ContentType } from '../../db/schema';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class PublicContentListQueryDto extends PaginationQueryDto {
  @Length(2, 16)
  locale!: string;

  @IsOptional()
  @IsIn(CONTENT_TYPES)
  type?: ContentType;

  @IsOptional()
  @Length(1, 200)
  category?: string;
}
