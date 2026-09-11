import { Module } from '@nestjs/common';
import { CategoriesController } from './controllers/categories.controller';
import { TagsController } from './controllers/tags.controller';
import { CategoriesRepository } from './repositories/categories.repository';
import { TagsRepository } from './repositories/tags.repository';

@Module({
  controllers: [CategoriesController, TagsController],
  providers: [CategoriesRepository, TagsRepository],
  exports: [CategoriesRepository, TagsRepository],
})
export class TaxonomyModule {}
