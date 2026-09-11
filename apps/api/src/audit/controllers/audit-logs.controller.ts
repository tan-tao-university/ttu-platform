import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RequirePermission } from '../../access/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../access/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../access/guards/permissions.guard';
import { paginationMeta } from '../../common/dto/pagination-query.dto';
import { AuditLogListQueryDto } from '../dto/audit-log-list-query.dto';
import { AuditLogsRepository } from '../repositories/audit-logs.repository';

/**
 * Read-only surface over `audit_logs` (design doc 06 §16) — the table is already written to by
 * other domains' sensitive operations (`content.publish`/`content.restore` today; every future
 * `*.publish`/`*.restore`/role-assignment/media-deletion action per the doc). `audit.read` is
 * withheld from every role but `super_admin` (see `role-permissions.catalog.ts`), so this
 * controller has no unprivileged branch — no view of the audit log is ever public.
 */
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditLogsController {
  constructor(private readonly auditLogs: AuditLogsRepository) {}

  @Get()
  @RequirePermission('audit.read')
  async list(@Query() query: AuditLogListQueryDto) {
    const { items, total } = await this.auditLogs.list(query);
    return { items, ...paginationMeta(query.page, query.pageSize, total) };
  }
}
