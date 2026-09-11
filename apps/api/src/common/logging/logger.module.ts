import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { logLevel } from '../../config/logging';

/**
 * Structured logging via Pino. Once `main.ts` calls `app.useLogger(app.get(Logger))` (the `Logger`
 * exported by `nestjs-pino`), every `@nestjs/common` `Logger` call in the app — including Nest's
 * own framework startup logs and every existing `new Logger(...)` call — routes through this
 * transport, and the `pino-http` middleware this module wires emits one structured line per HTTP
 * request/response (design doc 06 §16 keeps the HTTP access log a distinct stream from the
 * application log and the `audit_logs` security trail; this module is both).
 *
 * `genReqId` reuses an inbound `x-request-id` header — the cross-service correlation ID doc 06 §15
 * calls for between `apps/web`/`apps/admin`/`apps/api` — and echoes it back on the response;
 * otherwise it mints a fresh UUID. `AllExceptionsFilter` reads the exact same `req.id` back onto
 * its error envelope's `requestId` field, so one identifier ties the access log line and the error
 * response together instead of each minting its own, disconnected ID.
 *
 * `redact` strips credentials before they ever reach a log line — doc 06 §16: "Không lưu password,
 * access token, refresh token hoặc secret vào log/audit."
 */
@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: logLevel,
        genReqId: (req: IncomingMessage, res: ServerResponse) => {
          const inbound = req.headers['x-request-id'];
          const id = (Array.isArray(inbound) ? inbound[0] : inbound) ?? randomUUID();
          res.setHeader('x-request-id', id);
          return id;
        },
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
          censor: '[redacted]',
        },
        customLogLevel: (_req, res, err) => {
          if (err || res.statusCode >= 500) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },
        // Pretty, colorized output is a dev convenience; production ships plain NDJSON to stdout
        // for log aggregation, and never depends on the dev-only `pino-pretty` package.
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : { target: 'pino-pretty', options: { singleLine: true, colorize: true } },
      },
    }),
  ],
})
export class LoggerModule {}
