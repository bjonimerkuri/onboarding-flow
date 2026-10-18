import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingController } from './onboarding.controller';
import { OnboardingSession } from './onboarding.entity';
import { OnboardingService } from './onboarding.service';

@Module({
  imports: [TypeOrmModule.forFeature([OnboardingSession])],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
