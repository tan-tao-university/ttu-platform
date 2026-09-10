import { IsBoolean } from 'class-validator';

/** `key` is deliberately not editable — see `CreateMenuDto`'s doc comment. */
export class UpdateMenuDto {
  @IsBoolean()
  isActive!: boolean;
}
