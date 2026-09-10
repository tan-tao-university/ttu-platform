import { IsIn } from 'class-validator';
import { PAGE_TYPES, type PageType } from '../../db/schema';

/** `pageType` is immutable after creation, same precedent as content's `type` (doc 05 §8.3). */
export class CreatePageDto {
  @IsIn(PAGE_TYPES)
  pageType!: PageType;
}
