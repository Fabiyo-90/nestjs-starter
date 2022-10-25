import { Test, TestingModule } from '@nestjs/testing';
import { LogsWatchTaskService } from './logs-watch-task.service';

describe('LogsWatchTaskService', () => {
  let service: LogsWatchTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogsWatchTaskService],
    }).compile();

    service = module.get<LogsWatchTaskService>(LogsWatchTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
