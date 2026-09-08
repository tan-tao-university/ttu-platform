/** Postgres SQLSTATE error codes the `postgres` driver attaches as `.code`. */
const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

interface PostgresDriverError {
  code: string;
}

/**
 * drizzle-orm's postgres-js session wraps the driver's actual error as `Error: Failed
 * query: ...` with the real `postgres` error (the one carrying `.code`) attached as
 * `.cause`, not on the wrapper itself — checked directly against a real unique-violation
 * failure during development (see `xd://report_issue` history / PR verification notes).
 * Checks both so this keeps working if a caller ever passes the unwrapped driver error.
 */
function postgresCode(error: unknown): string | undefined {
  if (isPostgresDriverError(error)) return error.code;
  if (error instanceof Error && isPostgresDriverError(error.cause)) return error.cause.code;
  return undefined;
}

function isPostgresDriverError(error: unknown): error is PostgresDriverError {
  return error instanceof Error && 'code' in error && typeof error.code === 'string';
}

export function isUniqueViolation(error: unknown): boolean {
  return postgresCode(error) === UNIQUE_VIOLATION;
}

export function isForeignKeyViolation(error: unknown): boolean {
  return postgresCode(error) === FOREIGN_KEY_VIOLATION;
}
