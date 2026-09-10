import { IsIn, IsOptional, IsUUID, Length } from 'class-validator';
import {
  CONTENT_TYPES,
  EDITORIAL_STATUSES,
  type ContentType,
  type EditorialStatus,
} from '../../db/schema';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

/**
 * One query shape for the merged `GET /content` endpoint (design doc 06 §5 — a single resource
 * endpoint, RBAC decides depth of access). `status` and `categoryId` are only ever applied by
 * `ContentController.list`'s privileged (`content.read`) branch, which calls
 * `ContentItemsRepository.listForAdmin`; an anonymous/unprivileged caller's request still validates
 * against this same DTO, but those two fields have no effect on `listPublished`.
 */
export class ContentListQueryDto extends PaginationQueryDto {
  /**
   * Only `listPublished` (the unprivileged branch) actually filters by this; `listForAdmin` ignores
   * it.
   */
  @Length(2, 16)
  locale = 'vi';

  @IsOptional()
  @IsIn(CONTENT_TYPES)
  type?: ContentType;

  @IsOptional()
  @IsIn(EDITORIAL_STATUSES)
  status?: EditorialStatus;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @Length(1, 200)
  category?: string;
}
