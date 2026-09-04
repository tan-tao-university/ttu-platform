import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet());
  app.use(compression());

  // The public site and the admin dashboard are separate origins from the API host.
  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? '*').split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  // ValidationPipe (class-validator) lands once the first DTO does — no route accepts a
  // request body yet.

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
