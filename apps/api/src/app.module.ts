import { Module } from '@nestjs/common';
import { AccessModule } from './access/access.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './audit/audit.module';
import { CmsModule } from './cms/cms.module';
import { ContentModule } from './content/content.module';
import { LoggerModule } from './common/logging/logger.module';
import { MediaModule } from './media/media.module';
import { NavigationModule } from './navigation/navigation.module';
import { RedirectsModule } from './redirects/redirects.module';
import { RoutingModule } from './routing/routing.module';
import { SettingsModule } from './settings/settings.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';

/** Root application module for TTU Platform API. */
@Module({
  imports: [
    LoggerModule,
    AccessModule,
    TaxonomyModule,
    ContentModule,
    MediaModule,
    NavigationModule,
    AuditModule,
    CmsModule,
    RedirectsModule,
    SettingsModule,
    RoutingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
