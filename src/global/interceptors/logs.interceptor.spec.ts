import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { LogsInterceptor } from './logs.interceptor';

describe('LogsInterceptor', () => {
  it('should be defined', () => {
    expect(
      new LogsInterceptor(new HttpAdapterHost(), new ConfigService()),
    ).toBeDefined();
  });
});
