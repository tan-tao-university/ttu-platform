import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../access/decorators/current-user.decorator';
import { RequirePermission } from '../../access/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../access/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../access/guards/permissions.guard';
import type { AuthenticatedUser } from '../../access/access.types';
import { UpsertSiteSettingDto } from '../dto/upsert-site-setting.dto';
import { SiteSettingsService } from '../services/site-settings.service';

/**
 * Every catalog key is public-safe (see `SiteSettingsService`'s doc comment), so reads carry no
 * guard at all - only the write route requires `settings.manage`.
 */
@Controller('settings')
export class SiteSettingsController {
  constructor(private readonly settings: SiteSettingsService) {}

  @Get()
  async list() {
    return this.settings.list();
  }

  @Get(':key')
  async get(@Param('key') key: string) {
    return this.settings.findByKey(key);
  }

  @Put(':key')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('settings.manage')
  async upsert(
    @Param('key') key: string,
    @Body() dto: UpsertSiteSettingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.settings.upsert(key, dto, user.id);
  }
}
