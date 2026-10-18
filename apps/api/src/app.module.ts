import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { LoggerModule } from 'nestjs-pino';
import { config } from './config';
import { dataSourceOptions } from './data-source';
import { HealthController } from './health/health.controller';
import { OnboardingModule } from './onboarding/onboarding.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: config.logLevel,
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        genReqId: (req, res) => {
          const id = (req.headers['x-request-id'] as string) ?? randomUUID();
          res.setHeader('x-request-id', id);
          return id;
        },
      },
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    // A generous default for the whole API. Session creation tightens it with @Throttle. The in-memory
    // store is per instance, which is a known limitation on serverless (see docs/adr/0003).
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60 * 1000, limit: 300 }],
      skipIf: () => config.isTest,
    }),
    OnboardingModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
