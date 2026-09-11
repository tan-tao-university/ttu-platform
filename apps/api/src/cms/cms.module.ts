import { Module } from '@nestjs/common';
import { PagesController } from './controllers/pages.controller';
import { PageSectionsRepository } from './repositories/page-sections.repository';
import { PagesRepository } from './repositories/pages.repository';
import { PagePublishingService } from './services/page-publishing.service';
import { PageSectionsService } from './services/page-sections.service';

@Module({
  controllers: [PagesController],
  providers: [PagesRepository, PageSectionsRepository, PageSectionsService, PagePublishingService],
})
export class CmsModule {}
