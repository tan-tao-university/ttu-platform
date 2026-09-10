import { Module } from '@nestjs/common';
import { SiteSettingsController } from './controllers/site-settings.controller';
import { SiteSettingsRepository } from './repositories/site-settings.repository';
import { SiteSettingsService } from './services/site-settings.service';

@Module({
  controllers: [SiteSettingsController],
  providers: [SiteSettingsRepository, SiteSettingsService],
})
export class SettingsModule {}
