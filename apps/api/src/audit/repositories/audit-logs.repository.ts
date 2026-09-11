import { Injectable } from '@nestjs/common';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../db';
import { type AuditLog, auditLogs } from '../../db/schema';
import type { AuditLogListQueryDto } from '../dto/audit-log-list-query.dto';

@Injectable()
export class AuditLogsRepository {
  /**
   * Newest first — an audit trail is read chronologically backwards from "what just happened",
   * never forwards from the oldest row (doc 06 §16).
   */
  async list(query: AuditLogListQueryDto): Promise<{ items: AuditLog[]; total: number }> {
    const conditions = [
      query.actorUserId ? eq(auditLogs.actorUserId, query.actorUserId) : undefined,
      query.action ? eq(auditLogs.action, query.action) : undefined,
      query.entityType ? eq(auditLogs.entityType, query.entityType) : undefined,
      query.entityId ? eq(auditLogs.entityId, query.entityId) : undefined,
      query.occurredFrom ? gte(auditLogs.occurredAt, new Date(query.occurredFrom)) : undefined,
      query.occurredTo ? lte(auditLogs.occurredAt, new Date(query.occurredTo)) : undefined,
    ].filter((c) => c !== undefined);
    const where = conditions.length ? and(...conditions) : undefined;

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(auditLogs)
        .where(where)
        .orderBy(sql`${auditLogs.occurredAt} DESC`)
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(auditLogs)
        .where(where),
    ]);

    return { items, total: count };
  }
}
