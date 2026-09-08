import { Module } from '@nestjs/common';
import { AccessModule } from './access/access.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Further domain modules (content, media, ...) land here once each is designed and
// implemented — see docs/setup.md.
@Module({
  imports: [AccessModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
