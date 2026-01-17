import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

describe('ActivityController', () => {
  let controller: ActivityController;
  let activityService: jest.Mocked<ActivityService>;

  beforeEach(async () => {
    const mockActivityService = {
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        {
          provide: ActivityService,
          useValue: mockActivityService,
        },
      ],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
    activityService = module.get(ActivityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(activityService).toBeDefined();
  });
});
