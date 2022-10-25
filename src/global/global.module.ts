import { AppController } from './controllers/app/app.controller';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { Environement } from 'src/load.env';
import { ConfigModule } from '@nestjs/config';
import { LogsWatchTaskService } from './services/logs-watch-task/logs-watch-task.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LogsInterceptor } from './interceptors/logs.interceptor';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [
        () => {
          return { ...Environement };
        },
      ],
    }),
    GlobalModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LogsInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: LogsInterceptor,
    },
    LogsWatchTaskService,
  ],
})
export class GlobalModule {}
