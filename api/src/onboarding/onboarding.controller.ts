import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly service: OnboardingService) {}

  @Post()
  create() {
    return this.service.create();
  }

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
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.saveStep(id, step, body);
  }
}
