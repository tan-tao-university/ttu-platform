import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import helmet from 'helmet';
import { Logger as PinoAppLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ApiError } from './common/http/api-error';
import { AllExceptionsFilter } from './common/http/all-exceptions.filter';
import { flattenValidationErrors } from './common/http/validation-errors.util';

async function bootstrap() {
  // Buffered until `useLogger` below runs, so Nest's own startup logs (route mapping, "Nest
  // application successfully started") are structured Pino output too, not the default console.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoAppLogger));
  const logger = new Logger('Bootstrap');

  app.use(helmet());
  app.use(compression());

  // The public site and the admin dashboard are separate origins from the API host.
  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? '*').split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      // Reject, don't silently strip — an unknown field is a signal of client/API drift
      // (design doc 02 §11, 06 §13), not something to quietly ignore.
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors) =>
        new ApiError(
          422,
          'validation_error',
          'Dữ liệu không hợp lệ',
          'Request failed validation',
          flattenValidationErrors(validationErrors),
        ),
    }),
  );

  // Every route lives under /api/v1 so the Nginx on the server can route by path prefix.
  // The root info route (GET /) stays excluded so hitting the host directly reports service info.
  app.setGlobalPrefix('api/v1', { exclude: ['/'] });

  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 4001);
  // 0.0.0.0 so the container is reachable from the host, not only from inside it.
  await app.listen(port, '0.0.0.0');
  logger.log(`API listening on port ${port}`);
}
void bootstrap();
