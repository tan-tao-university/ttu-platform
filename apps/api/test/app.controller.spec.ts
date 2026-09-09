import { Test } from '@nestjs/testing';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

describe('AppController', () => {
  it('reports the service is running', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
    const controller = moduleRef.get(AppController);

    expect(controller.info()).toEqual({ service: '@ttu/api', status: 'ok' });
  });
});
