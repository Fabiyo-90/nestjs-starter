/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Application')
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  public async getIndex() {
    const info = this.configService.get('app').info;
    if (this.configService.get('.env').mode == 'dev') {
      info.mode = 'Developpement';
    } else {
      info.mode = 'Production';
    }
    return info;
  }
}
