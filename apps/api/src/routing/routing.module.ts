import { Module } from '@nestjs/common';
import { RedirectsModule } from '../redirects/redirects.module';
import { RoutingController } from './controllers/routing.controller';
import { PublicRoutesRepository } from './repositories/public-routes.repository';
import { RouteResolutionService } from './services/route-resolution.service';

@Module({
  imports: [RedirectsModule],
  controllers: [RoutingController],
  providers: [PublicRoutesRepository, RouteResolutionService],
})
export class RoutingModule {}
