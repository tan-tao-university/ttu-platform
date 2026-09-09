import { randomUUID, createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { imageSize } from 'image-size';
import { ApiError } from '../../common/http/api-error';
import type { MediaAsset } from '../../db/schema';
import { IMAGE_MIME_TYPES, MEDIA_TYPE_POLICIES } from '../media-type-policy';
import {
  MediaAssetsRepository,
  type NewMediaAssetInput,
} from '../repositories/media-assets.repository';
import { StorageService } from './storage.service';

/**
 * Orchestrates a single upload end to end (design doc 08 §7): validate → generate a backend-owned
 * key → write the object → persist metadata. Kept separate from `MediaAssetsRepository` (CRUD only)
 * because this is a multi-step, side-effecting workflow with its own failure-cleanup invariant, the
 * same reason `ContentPublishingService` sits apart from `ContentItemsRepository`.
 */
@Injectable()
export class MediaUploadService {
  constructor(
    private readonly storage: StorageService,
    private readonly mediaAssets: MediaAssetsRepository,
  ) {}

  async upload(file: Express.Multer.File, uploadedBy: string): Promise<MediaAsset> {
    const policy = MEDIA_TYPE_POLICIES[file.mimetype];
    if (!policy) {
      throw new ApiError(
        422,
        'validation_error',
        'Dữ liệu không hợp lệ',
        `Unsupported file type "${file.mimetype}"`,
        [
          {
            field: 'file',
            code: 'unsupported_type',
            message: 'File type is not in the media allowlist',
          },
        ],
      );
    }
    if (file.size > policy.maxBytes) {
      throw new ApiError(
        422,
        'validation_error',
        'Dữ liệu không hợp lệ',
        `File exceeds the ${policy.maxBytes}-byte limit for "${file.mimetype}"`,
        [
          {
            field: 'file',
            code: 'too_large',
            message: 'File exceeds the maximum size for this type',
          },
        ],
      );
    }
    if (!policy.isValidSignature(file.buffer)) {
      throw new ApiError(
        422,
        'validation_error',
        'Dữ liệu không hợp lệ',
        'File content does not match its declared MIME type',
        [
          {
            field: 'file',
            code: 'signature_mismatch',
            message: 'File signature does not match declared type',
          },
        ],
      );
    }

    // Doc 08 §13: width/height are always extracted server-side, never admin-entered.
    let width: number | null = null;
    let height: number | null = null;
    if (IMAGE_MIME_TYPES.has(file.mimetype)) {
      try {
        const dimensions = imageSize(file.buffer);
        width = dimensions.width ?? null;
        height = dimensions.height ?? null;
      } catch {
        throw new ApiError(
          422,
          'validation_error',
          'Dữ liệu không hợp lệ',
          'Unable to read image dimensions',
          [
            {
              field: 'file',
              code: 'unreadable_image',
              message: 'File could not be parsed as a valid image',
            },
          ],
        );
      }
    }

    const storageKey = generateStorageKey(file.mimetype, policy.extension);
    const checksumSha256 = createHash('sha256').update(file.buffer).digest('hex');

    await this.storage.putObject(storageKey, file.buffer, file.mimetype);

    const input: NewMediaAssetInput = {
      bucket: this.storage.bucket,
      storageKey,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      width,
      height,
      checksumSha256,
      uploadedBy,
    };

    try {
      return await this.mediaAssets.create(input);
    } catch (error) {
      // Doc 08 §7: a metadata insert failing after a successful object write must not leave an
      // orphan object in MinIO with nothing in ttu_main pointing at it.
      await this.storage.deleteObject(storageKey).catch(() => undefined);
      throw error;
    }
  }
}

/**
 * Doc 08 §6: the key is backend-generated, never derived from the client-supplied filename (path
 * traversal, Unicode/space handling, collisions). `{category}/{yyyy}/{mm}/{uuid}.{ext}` keeps
 * objects roughly time-ordered for operational browsing without encoding anything from the client.
 */
function generateStorageKey(mimeType: string, extension: string): string {
  const category = mimeType === 'application/pdf' ? 'documents' : 'images';
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${category}/${year}/${month}/${randomUUID()}.${extension}`;
}
