/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { GlobalModule } from './global/global.module';

@Module({
  imports: [
    GlobalModule,
    // Others module
  ],
  controllers: [],
  providers: [],
})
export class RootModule {}
