import { IsString, Length, Matches } from 'class-validator';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class UpsertTagTranslationDto {
  @IsString()
  @Length(1, 255)
  name!: string;

  @Matches(SLUG_PATTERN, { message: 'slug must be lowercase, hyphen-separated' })
  @Length(1, 200)
  slug!: string;
}
