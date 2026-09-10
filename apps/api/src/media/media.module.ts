import { Module } from '@nestjs/common';
import { MediaController } from './controllers/media.controller';
import { MediaAssetsRepository } from './repositories/media-assets.repository';
import { MediaUploadService } from './services/media-upload.service';
import { StorageService } from './services/storage.service';

@Module({
  controllers: [MediaController],
  providers: [MediaAssetsRepository, MediaUploadService, StorageService],
})
export class MediaModule {}
