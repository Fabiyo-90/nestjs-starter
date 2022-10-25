/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Catch,
  HttpException,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as IP from 'ip';

@Injectable()
@Catch()
export class LogsInterceptor implements NestInterceptor, ExceptionFilter {
  private readonly logger = new Logger(LogsInterceptor.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const headers = JSON.stringify(request.headers);

    const requestInfo = JSON.stringify({
      params: request.params,
      query: request.query,
      body: request.body,
    });
    const { method, url } = request;

    const baseUrl =
      `http://${IP.address()}` + ':' + this.configService.get('.env').port;

    let messageException: string;
    if (
      exception.response.error != undefined &&
      exception.response.error != null
    ) {
      messageException = `"error": "${exception.response.error}", "message": "${exception.response.message}"`;
    } else {
      messageException = `message: ${exception.response}`;
    }

    const message =
      `[METHOD:${method}] ${baseUrl + url} \r\n` +
      `\t[STATUS] {"code": "${httpStatus}", ${messageException}}\r\n` +
      `\t[REQUEST FROM] IP: ${request.socket.remoteAddress}\r\n` +
      `\t[HEADERS] ${headers}\r\n` +
      `\t[REQUEST] ${requestInfo}\r\n` +
      `\t[RESPONSE] ${exception.stack}\r\n`;

    if (httpStatus >= 500) {
      this.logger.error(message);
    } else if (httpStatus >= 400) {
      this.logger.warn(message);
    }

    httpAdapter.reply(
      response,
      {
        status: httpStatus,
        error: exception.response.error,
        message: exception.response.message,
      },
      httpStatus,
    );
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((data: any) => {
        const type = context.getType();
        const regexHttp = /http/i;
        if (regexHttp.exec(type)) {
          return this.interceptHttpRequest(context, data);
        }
      }),
    );
  }

  private interceptHttpRequest(context: ExecutionContext, data: any) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const headers = JSON.stringify(request.headers);
    const requestInfo = JSON.stringify({
      params: request.params,
      query: request.query,
      body: request.body,
    });
    const { method, url } = request;
    const { statusCode } = response;

    const baseUrl = `http://${IP.address()}:${
      this.configService.get('.env').port
    }`;

    const message =
      `[METHOD:${method}] ${baseUrl + url} \n` +
      `\t[STATUS] {"code": "${statusCode}"}\n` +
      `\t[REQUEST FROM] IP: ${request.socket.remoteAddress}\n` +
      `\t[HEADERS] ${headers}\n` +
      `\t[REQUEST] ${requestInfo}\n` +
      `\t[RESPONSE] ${JSON.stringify(data)}\n`;

    return this.logger.log(message);
  }
}
