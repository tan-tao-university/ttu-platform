import {
  Catch,
  HttpException,
  Injectable,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { ApiError, type ApiErrorDetail, type ApiErrorType } from './api-error';

interface NormalizedError {
  status: number;
  type: ApiErrorType;
  title: string;
  detail: string;
  errors?: ApiErrorDetail[];
}

const TITLE_BY_STATUS: Record<number, string> = {
  400: 'Yêu cầu không hợp lệ',
  401: 'Chưa xác thực',
  403: 'Không có quyền truy cập',
  404: 'Không tìm thấy tài nguyên',
  409: 'Xung đột dữ liệu',
  422: 'Dữ liệu không hợp lệ',
  429: 'Vượt giới hạn tần suất',
  500: 'Lỗi hệ thống',
};

const TYPE_BY_STATUS: Record<number, ApiErrorType> = {
  400: 'bad_request',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
  409: 'conflict',
  422: 'validation_error',
  429: 'rate_limited',
  500: 'internal_error',
};

/**
 * Renders every thrown value into the shared ProblemDetails-style error envelope (design doc 06
 * §15): `{ type, title, status, detail, instance, errors?, requestId }`. Never emits a raw DB
 * error, stack trace, or internal SQL — those are logged server-side only, via the same
 * request-scoped Pino logger (`request.log`, from the `pino-http` middleware `LoggerModule` wires)
 * that already logged this request's access-log line, so `requestId` ties both together.
 */
@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const normalized = normalize(exception);
    const requestId = request.id ?? randomUUID();

    if (normalized.status >= 500) {
      request.log.error(
        { err: exception instanceof Error ? exception : new Error(String(exception)) },
        `${request.method} ${request.url} -> ${normalized.status}`,
      );
    }

    response.status(normalized.status).json({
      type: normalized.type,
      title: normalized.title,
      status: normalized.status,
      detail: normalized.detail,
      instance: request.url,
      ...(normalized.errors ? { errors: normalized.errors } : {}),
      requestId,
    });
  }
}

function normalize(exception: unknown): NormalizedError {
  if (exception instanceof ApiError) {
    return {
      status: exception.status,
      type: exception.type,
      title: exception.title,
      detail: exception.message,
      errors: exception.errors,
    };
  }
  if (exception instanceof HttpException) {
    return normalizeHttpException(exception);
  }
  // Unknown errors (DB errors, programmer errors, ...) never leak their message or stack.
  return {
    status: 500,
    type: 'internal_error',
    title: TITLE_BY_STATUS[500],
    detail: 'Internal server error',
  };
}

function normalizeHttpException(exception: HttpException): NormalizedError {
  const status = exception.getStatus();
  const responseBody = exception.getResponse();
  const type = TYPE_BY_STATUS[status] ?? 'bad_request';
  const title = TITLE_BY_STATUS[status] ?? exception.name;

  if (typeof responseBody === 'string') {
    return { status, type, title, detail: responseBody };
  }
  // HttpException.getResponse() is `string | object`; narrowed to `object` here. Nest's
  // default body shape is `{ message, error, statusCode }`, but only `message` is ours to
  // trust the shape of.
  const message = 'message' in responseBody ? responseBody.message : undefined;
  if (Array.isArray(message)) {
    // NestJS's default ValidationPipe error shape (before our exceptionFactory replaces
    // it): an array of human-readable strings, no field/code structure.
    return {
      status,
      type,
      title,
      detail: 'Request failed validation',
      errors: toErrorDetails(message),
    };
  }
  if (typeof message === 'string') {
    return { status, type, title, detail: message };
  }
  return { status, type, title, detail: exception.message };
}

function toErrorDetails(messages: unknown[]): ApiErrorDetail[] {
  return messages.map((message) => ({
    field: '',
    code: 'invalid',
    message: typeof message === 'string' ? message : String(message),
  }));
}
