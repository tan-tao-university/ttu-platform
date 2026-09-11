import { optionalEnv } from './database';

/**
 * Pino log level (design doc 06 §16: application log is a distinct stream from the HTTP access log
 * and the `audit_logs` security trail). One of `trace`/`debug`/`info`/`warn`/`error`/`fatal`/
 * `silent` — see https://getpino.io/#/docs/api?id=level-string.
 */
export const logLevel = optionalEnv('LOG_LEVEL', 'info');
