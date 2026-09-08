import { Module } from '@nestjs/common';
import { AdminCategoriesController } from './controllers/admin-categories.controller';
import { AdminTagsController } from './controllers/admin-tags.controller';
import { CategoriesRepository } from './repositories/categories.repository';
import { TagsRepository } from './repositories/tags.repository';

@Module({
  controllers: [AdminCategoriesController, AdminTagsController],
  providers: [CategoriesRepository, TagsRepository],
  exports: [CategoriesRepository, TagsRepository],
})
export class TaxonomyModule {}
