import { Module } from '@nestjs/common';
import { AdminNavigationController } from './controllers/admin-navigation.controller';
import { PublicNavigationController } from './controllers/public-navigation.controller';
import { MenusRepository } from './repositories/menus.repository';

@Module({
  controllers: [AdminNavigationController, PublicNavigationController],
  providers: [MenusRepository],
})
export class NavigationModule {}
