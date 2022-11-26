import { CorsConfiguration } from './configs/cors.config';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Environement } from 'src/load.env';
import { RootModule } from 'src/root.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonConfig } from './configs/winston';
import * as ip from 'ip';

const logger = new Logger('InstanceLoader');

// For web application
async function bootstrapWeppApp() {
  const app = await NestFactory.create<NestExpressApplication>(RootModule, {
    logger: WinstonConfig,
  });

  app.enableCors(CorsConfiguration);

  // Use global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      whitelist: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
  });

  try {
    // Integrate swagger
    const config = new DocumentBuilder()
      .setTitle(Environement['app'].info.name)
      .setDescription(Environement['app'].info.service)
      .setVersion(Environement['app'].info.version)
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/swagger', app, document);

    const basePath =
      Environement['.env'].baseUrl == null ? '/' : Environement['.env'].baseUrl;

    app.setGlobalPrefix(basePath);

    await app.listen(Environement['.env'].port);

    const baseUrl =
      'http://' + ip.address() + ':' + Environement['.env'].port + basePath;

    logger.log(`Nest application running on ${baseUrl}`, 'NestApplication');
  } catch (error) {
    logger.error(error.stack);
  }
}

bootstrapWeppApp();
