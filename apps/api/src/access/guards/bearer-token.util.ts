/**
 * Shared by every guard that reads the `Authorization` header — `JwtAuthGuard` (mandatory) and
 * `OptionalJwtAuthGuard` (auth only when a token is actually presented).
 */
export function extractBearerToken(value?: string): string | undefined {
  if (!value) return undefined;
  const [type, token] = value.split(' ');
  return type === 'Bearer' ? token : undefined;
}
