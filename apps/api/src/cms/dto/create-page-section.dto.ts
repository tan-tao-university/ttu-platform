import { IsBoolean, IsInt, IsObject, IsOptional, Length, Min } from 'class-validator';

/**
 * `expectedLockVersion` is `pages.lock_version` as the caller last saw it (design doc 06 §14's
 * optimistic-concurrency pattern, applied to the page's shared section structure): the repository
 * rejects with `409` if the page has moved on since, so two editors restructuring the same page at
 * once never silently clobber each other.
 */
export class CreatePageSectionDto {
  @Length(1, 150)
  componentKey!: string;

  @IsInt()
  @Min(1)
  componentVersion!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  style?: Record<string, unknown>;

  @IsInt()
  @Min(0)
  expectedLockVersion!: number;
}
