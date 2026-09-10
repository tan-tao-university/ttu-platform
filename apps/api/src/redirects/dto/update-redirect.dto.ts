import { IsBoolean, IsIn, IsOptional, Matches } from 'class-validator';
import {
  REDIRECT_PATH_PATTERN,
  REDIRECT_STATUS_CODES,
  type RedirectStatusCode,
} from '../redirect-path.util';

/** `locale`/`sourcePath` are immutable after creation - see `CreateRedirectDto`'s doc comment. */
export class UpdateRedirectDto {
  @IsOptional()
  @Matches(REDIRECT_PATH_PATTERN, {
    message: 'destinationPath must start with "/" and contain no "?" or "#"',
  })
  destinationPath?: string;

  @IsOptional()
  @IsIn(REDIRECT_STATUS_CODES)
  statusCode?: RedirectStatusCode;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
