import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { ActivityRepository } from './activity.repository';
import { TripService } from '../trip/trip.service';

describe('ActivityService', () => {
  let service: ActivityService;
  let activityRepository: jest.Mocked<ActivityRepository>;
  let tripService: jest.Mocked<TripService>;

  beforeEach(async () => {
    const mockActivityRepository = {
      create: jest.fn(),
      update: jest.fn(),
      getAll: jest.fn(),
      remove: jest.fn(),
    };
    const mockTripService = {
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
          provide: TripService,
          useValue: mockTripService,
        },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    activityRepository = module.get(ActivityRepository);
    tripService = module.get(TripService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(activityRepository).toBeDefined();
    expect(tripService).toBeDefined();
  });
});
