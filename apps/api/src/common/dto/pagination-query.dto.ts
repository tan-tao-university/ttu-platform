import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

/** List response shape design doc 06 §7.2 specifies: `{ items, page, pageSize, total, totalPages }`. */
export class PaginationQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;
}

export function paginationMeta(page: number, pageSize: number, total: number) {
  return { page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}
