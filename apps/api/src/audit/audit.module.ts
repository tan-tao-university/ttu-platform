import { Module } from '@nestjs/common';
import { AuditLogsController } from './controllers/audit-logs.controller';
import { AuditLogsRepository } from './repositories/audit-logs.repository';

@Module({
  controllers: [AuditLogsController],
  providers: [AuditLogsRepository],
})
export class AuditModule {}
