import { Module } from '@nestjs/common';
import { AccessModule } from './access/access.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContentModule } from './content/content.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';

// Further domain modules (media, navigation, ...) land here once each is designed and
// implemented — see docs/setup.md.
@Module({
  imports: [AccessModule, TaxonomyModule, ContentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
