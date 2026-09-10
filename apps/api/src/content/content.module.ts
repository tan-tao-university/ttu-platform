import { Module } from '@nestjs/common';
import { ContentController } from './controllers/content.controller';
import { ContentAssignmentsRepository } from './repositories/content-assignments.repository';
import { ContentItemsRepository } from './repositories/content-items.repository';
import { ContentPublishingService } from './services/content-publishing.service';

@Module({
  controllers: [ContentController],
  providers: [ContentItemsRepository, ContentAssignmentsRepository, ContentPublishingService],
})
export class ContentModule {}
