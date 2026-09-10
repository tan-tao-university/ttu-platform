import { ArrayMinSize, ArrayUnique, IsInt, IsUUID, Min } from 'class-validator';

/**
 * `order` is the section IDs in their new top-to-bottom order — must be exactly the page's current
 * section set, no more, no fewer.
 */
export class ReorderPageSectionsDto {
  @IsUUID('4', { each: true })
  @ArrayUnique()
  @ArrayMinSize(1)
  order!: string[];

  @IsInt()
  @Min(0)
  expectedLockVersion!: number;
}
