import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  it('reports the service is running', async () => {
    const moduleRef = await Test.createTestingModule({ controllers: [AppController] }).compile();
    const controller = moduleRef.get(AppController);

    expect(controller.info()).toEqual({ service: '@ttu/api', status: 'ok' });
  });
});
