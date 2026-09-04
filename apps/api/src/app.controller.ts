import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/** The one route outside `/api/v1` (see `main.ts`) — hitting the bare host reports what is
 *  running instead of a 404, which is the first thing anyone debugging routing on the
 *  server checks. Doubles as the Docker healthcheck target until a real one is needed. */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  info() {
    return this.appService.getInfo();
  }
}
