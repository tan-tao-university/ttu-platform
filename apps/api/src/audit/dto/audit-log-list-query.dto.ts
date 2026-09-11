import { IsISO8601, IsOptional, IsUUID, Length } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

/**
 * Query shape for `GET /api/v1/audit-logs` (design doc 06 §16). All filters are optional and
 * combine with AND; `occurredFrom`/`occurredTo` bound `occurred_at`, inclusive on both ends.
 */
export class AuditLogListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsOptional()
  @Length(1, 150)
  action?: string;

  @IsOptional()
  @Length(1, 100)
  entityType?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsISO8601()
  occurredFrom?: string;

  @IsOptional()
  @IsISO8601()
  occurredTo?: string;
}
