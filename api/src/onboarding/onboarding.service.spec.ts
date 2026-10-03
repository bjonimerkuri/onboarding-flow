import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OnboardingService } from './onboarding.service';
import { OnboardingSession } from './onboarding.entity';

const makeSession = (overrides = {}) => ({
  id: '1',
  currentStep: 1,
  data: {},
  completed: false,
  ...overrides,
});

describe('OnboardingService', () => {
  let service: OnboardingService;
  const repo = {
    findOneBy: jest.fn(),
    save: jest.fn(async (s) => s),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        OnboardingService,
        { provide: getRepositoryToken(OnboardingSession), useValue: repo },
      ],
    }).compile();
    service = module.get(OnboardingService);
  });

  it('rejects an invalid email', async () => {
    repo.findOneBy.mockResolvedValue(makeSession());
    await expect(
      service.saveStep('1', 1, { fullName: 'Bjoni', email: 'nope' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not allow skipping steps', async () => {
    repo.findOneBy.mockResolvedValue(makeSession({ currentStep: 1 }));
    await expect(
      service.saveStep('1', 3, { acceptTerms: true }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('advances to the next step after a valid submit', async () => {
    repo.findOneBy.mockResolvedValue(makeSession());
    const result = await service.saveStep('1', 1, {
      fullName: 'Bjoni M',
      email: 'bjoni@example.com',
    });
    expect(result.currentStep).toBe(2);
    expect(result.completed).toBe(false);
  });

  it('completes the session on the last step', async () => {
    repo.findOneBy.mockResolvedValue(makeSession({ currentStep: 3 }));
    const result = await service.saveStep('1', 3, { acceptTerms: true });
    expect(result.completed).toBe(true);
  });
});
