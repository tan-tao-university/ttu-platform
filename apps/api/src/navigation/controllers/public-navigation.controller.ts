import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { MenusRepository } from '../repositories/menus.repository';

/**
 * Public API (doc 06 §5.1): no auth, active menus only, visible items only, each item's href
 * already resolved server-side — the frontend renders the tree, it does not resolve targets.
 */
@Controller('public/menus')
export class PublicNavigationController {
  constructor(private readonly menus: MenusRepository) {}

  @Get(':key')
  async get(@Param('key') key: string, @Query('locale') locale = 'vi') {
    const tree = await this.menus.resolvePublicTree(key, locale);
    if (!tree) throw new NotFoundException(`Menu "${key}" not found`);
    return { key, locale, items: tree };
  }
}
