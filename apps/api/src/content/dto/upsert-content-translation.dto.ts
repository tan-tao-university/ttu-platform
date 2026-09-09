import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// doc 05 §17: starts with "/", no query string or hash — the full draft path an editor is
// working on, distinct from `public_routes.path` (only set once published).
const PATH_PATTERN = /^\/[a-z0-9\-/]*$/;

export class UpsertContentTranslationDto {
  @Matches(SLUG_PATTERN, { message: 'slug must be lowercase, hyphen-separated' })
  @Length(1, 200)
  slug!: string;

  @Matches(PATH_PATTERN, {
    message: 'path must start with "/" and contain no query string or hash',
  })
  @Length(1, 2000)
  path!: string;

  @IsString()
  @Length(1, 500)
  title!: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsObject()
  body!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  bodyFormat?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  seoDescription?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  ogTitle?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  ogDescription?: string;

  @IsOptional()
  @IsUUID()
  ogImageId?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  canonicalUrl?: string;

  @IsOptional()
  @IsBoolean()
  robotsIndex?: boolean;

  @IsOptional()
  @IsBoolean()
  robotsFollow?: boolean;
}
