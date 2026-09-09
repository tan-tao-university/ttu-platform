import { IsOptional, IsUUID } from 'class-validator';

/**
 * `type` is deliberately not editable: it decides whether an `events` row is valid for this content
 * item, and changing it out from under a published translation would orphan that invariant (design
 * doc 05 §8.3 — "contents.type = 'EVENT' trước khi tạo events").
 */
export class UpdateContentItemDto {
  @IsOptional()
  @IsUUID()
  featuredMediaId?: string | null;
}
