import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { ActivityRepository } from './activity.repository';
import { TripsService } from '../trips/trips.service';

describe('ActivityService', () => {
  let service: ActivityService;
  let activityRepository: jest.Mocked<ActivityRepository>;
  let tripsService: jest.Mocked<TripsService>;

  beforeEach(async () => {
    const mockActivityRepository = {
      create: jest.fn(),
      update: jest.fn(),
      getAll: jest.fn(),
      remove: jest.fn(),
    };
    const mockTripsService = {
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: ActivityRepository,
          useValue: mockActivityRepository,
        },
        {
          provide: TripsService,
          useValue: mockTripsService,
        },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    activityRepository = module.get(ActivityRepository);
    tripsService = module.get(TripsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(activityRepository).toBeDefined();
    expect(tripsService).toBeDefined();
  });
});
