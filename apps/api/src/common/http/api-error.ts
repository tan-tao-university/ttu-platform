export interface ApiErrorDetail {
  field: string;
  code: string;
  message: string;
}

/**
 * Known error `type` slugs plus an open string, so callers get autocomplete for the common
 * cases without the type refusing a domain-specific one.
 */
export type ApiErrorType =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'validation_error'
  | 'rate_limited'
  | 'internal_error'
  | (string & {});

/**
 * Thrown by application code to produce the shared error envelope (design doc 06 §15) with
 * a specific `type`/`status`/`detail` and, for validation failures, field-level `errors`.
 * Caught and rendered by `AllExceptionsFilter`.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly type: ApiErrorType,
    public readonly title: string,
    detail: string,
    public readonly errors?: ApiErrorDetail[],
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}
