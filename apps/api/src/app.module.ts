import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

// Domain modules (content, auth, storage) land here once the CMS's schema and auth flow
// are designed — see docs/setup.md. Kept to a bare bootstrap until then.
@Module({
  controllers: [AppController],
})
export class AppModule {}
