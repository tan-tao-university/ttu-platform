import { IsIn, IsOptional, Length } from 'class-validator';
import {
  EDITORIAL_STATUSES,
  PAGE_TYPES,
  type EditorialStatus,
  type PageType,
} from '../../db/schema';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

/**
 * One query shape for the merged `GET /pages` endpoint (design doc 06 §5 — a single resource
 * endpoint, RBAC decides depth of access), mirroring `ContentListQueryDto`. `status` is only ever
 * applied by the privileged (`page.read`) branch.
 */
export class PageListQueryDto extends PaginationQueryDto {
  /** Only `listPublished` (the unprivileged branch) filters by this; `listForAdmin` ignores it. */
  @Length(2, 16)
  locale = 'vi';

  @IsOptional()
  @IsIn(PAGE_TYPES)
  pageType?: PageType;

  @IsOptional()
  @IsIn(EDITORIAL_STATUSES)
  status?: EditorialStatus;
}
