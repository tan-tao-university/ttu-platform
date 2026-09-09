import { IsOptional, IsString, Length } from 'class-validator';

/**
 * Doc 08 §14: alt text and caption are the only locale-dependent fields on a media asset — every
 * other column (dimensions, checksum, storage key, ...) is shared across locales.
 */
export class UpsertMediaTranslationDto {
  @IsOptional()
  @IsString()
  @Length(0, 500)
  altText?: string;

  @IsOptional()
  @IsString()
  caption?: string;
}
