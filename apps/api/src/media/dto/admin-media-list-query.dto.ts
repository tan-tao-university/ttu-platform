import { IsIn, IsOptional, IsString, Length } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { MEDIA_TYPE_POLICIES } from '../media-type-policy';

const ALLOWED_MIME_TYPES = Object.keys(MEDIA_TYPE_POLICIES);

export class AdminMediaListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(ALLOWED_MIME_TYPES)
  mimeType?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  search?: string;
}
