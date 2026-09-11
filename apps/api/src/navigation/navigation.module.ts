import { Module } from '@nestjs/common';
import { NavigationController } from './controllers/navigation.controller';
import { MenusRepository } from './repositories/menus.repository';

@Module({
  controllers: [NavigationController],
  providers: [MenusRepository],
})
export class NavigationModule {}
