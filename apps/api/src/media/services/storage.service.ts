import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { storageConfig } from '../../config/storage';

/**
 * Thin wrapper around the S3-compatible MinIO client (design doc 08). Object writes/deletes/reads
 * all go through here so `MediaAssetsRepository` and callers never touch storage credentials or the
 * SDK directly.
 */
@Injectable()
export class StorageService {
  private readonly client = new S3Client({
    endpoint: storageConfig.endpoint,
    region: storageConfig.region,
    // MinIO requires path-style bucket addressing (`endpoint/bucket/key`), not the AWS-default
    // virtual-hosted-style (`bucket.endpoint/key`) — doc 08 §5.
    forcePathStyle: true,
    credentials: {
      accessKeyId: storageConfig.accessKeyId,
      secretAccessKey: storageConfig.secretAccessKey,
    },
  });

  readonly bucket = storageConfig.bucket;

  async putObject(key: string, body: Buffer, mimeType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: mimeType }),
    );
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  /** Doc 08 §19: orphan detection needs to tell "object exists" from "object missing" reliably. */
  async objectExists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch (error) {
      if (error instanceof NotFound) return false;
      throw error;
    }
  }

  /**
   * `ttu-data-infra`'s `ttu-media` bucket is provisioned with an anonymous-download policy (doc 08
   * §20: "TTU Main là public website nên không nên biến mọi asset thành private nếu không cần"), so
   * delivery is a plain, immutable, long-cacheable URL — never a MinIO Console URL, and no signing
   * secret embedded in it. `publicUrlBase` is a distinct config value from the write `endpoint` so
   * production can front reads with a CDN/reverse-proxy domain without this method changing (§21).
   */
  getDeliveryUrl(key: string): string {
    return `${storageConfig.publicUrlBase}/${this.bucket}/${key}`;
  }
}
