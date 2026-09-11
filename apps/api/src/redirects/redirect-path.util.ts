/** Doc 05 §12.1: `redirects.status_code` is constrained to these four values at the DB layer too. */
export const REDIRECT_STATUS_CODES = [301, 302, 307, 308] as const;
export type RedirectStatusCode = (typeof REDIRECT_STATUS_CODES)[number];

/**
 * Doc 05 §12.1's "path hợp lệ" requirement: must start with `/` and carry no query string or
 * fragment (those belong to the request the redirect responds to, not to the stored rule).
 */
export const REDIRECT_PATH_PATTERN = /^\/[^?#]*$/;
