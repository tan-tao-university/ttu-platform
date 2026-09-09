import { IsUUID } from 'class-validator';

export class AssignTagDto {
  @IsUUID()
  tagId!: string;
}
