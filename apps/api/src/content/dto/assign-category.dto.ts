import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class AssignCategoryDto {
  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
