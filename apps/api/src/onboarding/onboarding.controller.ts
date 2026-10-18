import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { OnboardingService } from './onboarding.service';

@ApiTags('onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly service: OnboardingService) {}

  // Sessions are anonymous, so cap creation per client IP: 60 per 10 minutes.
  @Post()
  @Throttle({ default: { ttl: 10 * 60 * 1000, limit: 60 } })
  create() {
    return this.service.create();
  }

  // Declared before ':id' so "stats" is not parsed as a session id.
  @Get('stats/funnel')
  funnel() {
    return this.service.funnel();
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(id);
  }

  @Patch(':id/steps/:step')
  saveStep(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('step', ParseIntPipe) step: number,
    @Body() body: unknown,
  ) {
    return this.service.saveStep(id, step, body);
  }
}
