import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingModule } from './onboarding/onboarding.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url:
        process.env.DATABASE_URL ??
        'postgres://postgres:postgres@localhost:5432/onboarding',
      autoLoadEntities: true,
      synchronize: true,
    }),
    OnboardingModule,
  ],
})
export class AppModule {}
