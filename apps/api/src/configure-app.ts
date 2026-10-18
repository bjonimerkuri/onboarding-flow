import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Express } from 'express';
import helmet from 'helmet';
import { config } from './config';

export function configureApp(app: INestApplication, options: { swaggerUi: boolean }) {
  const server = app.getHttpAdapter().getInstance() as Express;
  server.set('trust proxy', 1);
  server.disable('x-powered-by');

  app.setGlobalPrefix('api');
  app.use(helmet({ contentSecurityPolicy: config.isProd ? undefined : false }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Onboarding Flow API')
      .setDescription('Multi-step onboarding with server-side validation, resumable progress and a funnel report.')
      .setVersion('1.0')
      .build(),
  );


  server.get('/api/openapi.json', (_req, res) => {
    res.json(document);
  });
  if (options.swaggerUi) SwaggerModule.setup('api/docs', app, document);
}
