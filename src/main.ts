import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { join } from 'path';
import { LoadTimeInterceptor } from './interceptors/load-time.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import supertokens from 'supertokens-node';
import { SupertokensExceptionFilter } from './auth/filters/auth.filter';
import { HttpExceptionFilter } from './filters/app.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  const hbs = require('hbs')
  app.setViewEngine('hbs');

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  hbs.registerPartials(join(__dirname, '..', 'views/partials'));


  const config = new DocumentBuilder()
    .setTitle('Bakulina Tatiana Art Shop')
    .setDescription('The API of the Bakulina Tatiana art shop.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
    credentials: true,
  });

  app.useGlobalInterceptors(new LoadTimeInterceptor());
  app.useGlobalFilters(
    new SupertokensExceptionFilter(),
    new HttpExceptionFilter(),
  );

  console.log("App started!");

  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
