import { IsBoolean, IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';
import {
  REDIRECT_PATH_PATTERN,
  REDIRECT_STATUS_CODES,
  type RedirectStatusCode,
} from '../redirect-path.util';

/**
 * `locale` omitted/`null` is the global fallback tier (doc 05 §12.1): consulted only when no
 * locale-specific redirect and no live `public_routes` entry match. `locale`/`sourcePath` are
 * immutable after creation - `UpdateRedirectDto` deliberately omits them, the same precedent
 * `page_sections.componentKey` sets for identity fields a write can't repoint after insert.
 */
export class CreateRedirectDto {
  @IsOptional()
  @IsString()
  @Length(1, 16)
  locale?: string;

  @IsString()
  @Matches(REDIRECT_PATH_PATTERN, {
    message: 'sourcePath must start with "/" and contain no "?" or "#"',
  })
  sourcePath!: string;

  @IsString()
  @Matches(REDIRECT_PATH_PATTERN, {
    message: 'destinationPath must start with "/" and contain no "?" or "#"',
  })
  destinationPath!: string;

  @IsOptional()
  @IsIn(REDIRECT_STATUS_CODES)
  statusCode?: RedirectStatusCode;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
