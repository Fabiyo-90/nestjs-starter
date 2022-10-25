/* eslint-disable @typescript-eslint/no-unused-vars */
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as DayJs from 'dayjs';
import { readdirSync, existsSync, unlinkSync } from 'fs';

@Injectable()
export class LogsWatchTaskService {
  private readonly logger = new Logger(LogsWatchTaskService.name);

  constructor(private readonly configService: ConfigService) {
    this.handleCron();
  }

  @Cron('00 45 23 * * *', {
    name: 'LogsWatchTask',
  })
  async handleCron() {
    const logsDirectory = this.configService.get('directories').logs;
    const directories = readdirSync(logsDirectory);
    for (const dir of directories) {
      const files = readdirSync(join(logsDirectory, dir));
      for (const file of files) {
        const datePassed = new Date(
          DayJs()
            .subtract(this.configService.get('.env').deleteLogsAfterDays, 'day')
            .format('YYYY-MM-DD'),
        );
        const fileNameDate = new Date(file.split('_')[0]);

        const pathFile = join(join(logsDirectory, dir), file);
        if (
          fileNameDate.getTime() <= datePassed.getTime() &&
          existsSync(pathFile)
        ) {
          unlinkSync(pathFile);
        }
      }
    }
  }
}
