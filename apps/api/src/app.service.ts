import { Injectable } from '@nestjs/common';

/**
 * Business logic stays out of `AppController` even when there is only one method — content modules
 * added later follow the same controller/service split, not an exception to it.
 */
@Injectable()
export class AppService {
  getInfo(): { service: string; status: 'ok' } {
    return { service: '@ttu/api', status: 'ok' };
  }
}
