import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { join } from 'path';
import { Environement } from 'src/load.env';

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.ms(),
  winston.format.printf((info) => {
    const { message } = info;

    if (info.data) {
      info.message = `${message} ${JSON.stringify(info.data)}`;
      delete info.data; // We added `data` to the message so we can delete it
    }

    const context =
      info.context != undefined ? info.context : info.stack.toString();

    return `[Nest] ${info.level} ${info.timestamp} [${context}] ${info.message} ${info.ms}`;
  }),
);

// Default Config of levels of errors
const logsLevel = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

const erros_directories = join(Environement['directories'].logs, 'errors');
const exceptions_directories = join(
  Environement['directories'].logs,
  'exceptions',
);
const http_directories = join(Environement['directories'].logs, 'http');

export const WinstonConfig = WinstonModule.createLogger({
  levels: logsLevel,
  format,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        nestWinstonModuleUtilities.format.nestLike('Nest', {
          colors: true,
          prettyPrint: false,
        }),
      ),
    }),

    new winston.transports.DailyRotateFile({
      level: 'http',
      datePattern: 'YYYY-MM-DD',
      filename: `${join(http_directories, '%DATE%_http.log')}`,
    }),

    new winston.transports.DailyRotateFile({
      level: 'warn',
      datePattern: 'YYYY-MM-DD',
      handleExceptions: false,
      filename: `${join(exceptions_directories, '%DATE%_exceptions.log')}`,
    }),

    new winston.transports.DailyRotateFile({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      handleExceptions: true,
      filename: `${join(erros_directories, '%DATE%_errors.log')}`,
    }),
  ],
});
