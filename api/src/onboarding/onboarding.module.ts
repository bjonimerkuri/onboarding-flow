import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardingSession } from './onboarding.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OnboardingSession])],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
