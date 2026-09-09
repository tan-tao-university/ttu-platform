import { AppService } from '@/app.service';

describe('AppService', () => {
  it('reports the service is running', () => {
    expect(new AppService().getInfo()).toEqual({ service: '@ttu/api', status: 'ok' });
  });
});
