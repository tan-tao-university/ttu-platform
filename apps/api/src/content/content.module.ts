import { Module } from '@nestjs/common';
import { AdminContentController } from './controllers/admin-content.controller';
import { PublicContentController } from './controllers/public-content.controller';
import { ContentAssignmentsRepository } from './repositories/content-assignments.repository';
import { ContentItemsRepository } from './repositories/content-items.repository';
import { ContentPublishingService } from './services/content-publishing.service';

@Module({
  controllers: [AdminContentController, PublicContentController],
  providers: [ContentItemsRepository, ContentAssignmentsRepository, ContentPublishingService],
})
export class ContentModule {}
