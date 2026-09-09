import { Module } from '@nestjs/common';
import { AdminMediaController } from './controllers/admin-media.controller';
import { MediaAssetsRepository } from './repositories/media-assets.repository';
import { MediaUploadService } from './services/media-upload.service';
import { StorageService } from './services/storage.service';

@Module({
  controllers: [AdminMediaController],
  providers: [MediaAssetsRepository, MediaUploadService, StorageService],
})
export class MediaModule {}
