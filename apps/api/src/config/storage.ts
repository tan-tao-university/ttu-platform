import { optionalEnv, requireEnv } from './database';

/**
 * MinIO/S3 object storage configuration (design doc 08 §1: binary objects live in MinIO, never in
 * PostgreSQL).
 *
 * Separated from `config/database.ts` so database-only scripts (seed, migrations, super-admin
 * bootstrap) do not require storage credentials to run.
 */

/** Write endpoint the app talks to directly — e.g. `http://127.0.0.1:9000` in dev. */
const s3Endpoint = requireEnv('S3_ENDPOINT');

export const storageConfig = {
  endpoint: s3Endpoint,
  /** MinIO ignores region validation but the S3 SDK requires a value be set. */
  region: optionalEnv('S3_REGION', 'us-east-1'),
  /**
   * `ttu-data-infra` provisions one public bucket (`ttu-media`, anonymous-download bucket policy —
   * doc 08 §5, §20: "TTU Main là public website nên không nên biến mọi asset thành private nếu
   * không cần"). Downloads never need signing; only the scoped app credential below can write.
   */
  bucket: requireEnv('S3_BUCKET'),
  /** `ttu-data-infra`'s scoped `app-readwrite` service account — never the MinIO root user. */
  accessKeyId: requireEnv('S3_ACCESS_KEY'),
  secretAccessKey: requireEnv('S3_SECRET_KEY'),
  /**
   * Public read origin, if different from `S3_ENDPOINT` (e.g. a CDN/reverse-proxy domain in
   * production — doc 08 §21). Defaults to `S3_ENDPOINT` itself, which is what a direct MinIO dev
   * setup needs.
   */
  publicUrlBase: optionalEnv('S3_PUBLIC_URL_BASE', s3Endpoint),
} as const;
