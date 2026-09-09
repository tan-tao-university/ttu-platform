import { Module } from '@nestjs/common';
import { AccessModule } from './access/access.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContentModule } from './content/content.module';
import { MediaModule } from './media/media.module';
import { NavigationModule } from './navigation/navigation.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';

/** Root application module for TTU Platform API. */
@Module({
  imports: [AccessModule, TaxonomyModule, ContentModule, MediaModule, NavigationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
