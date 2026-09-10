import { IsObject } from 'class-validator';

/**
 * Validated against the section's registered component `contentSchema` in the service layer, not
 * here — the shape is data-driven per `componentKey`/`componentVersion`, not statically known at
 * the DTO level.
 */
export class UpsertPageSectionTranslationDto {
  @IsObject()
  content!: Record<string, unknown>;
}
