import { Module } from '@nestjs/common';
import { RedirectsController } from './controllers/redirects.controller';
import { RedirectsRepository } from './repositories/redirects.repository';
import { RedirectsService } from './services/redirects.service';

@Module({
  controllers: [RedirectsController],
  providers: [RedirectsRepository, RedirectsService],
  exports: [RedirectsRepository],
})
export class RedirectsModule {}
