import { IsString, Length, Matches } from 'class-validator';
import { REDIRECT_PATH_PATTERN } from '../../redirects/redirect-path.util';

export class ResolveRouteQueryDto {
  @IsString()
  @Length(1, 16)
  locale!: string;

  @IsString()
  @Matches(REDIRECT_PATH_PATTERN, { message: 'path must start with "/" and contain no "?" or "#"' })
  path!: string;
}
