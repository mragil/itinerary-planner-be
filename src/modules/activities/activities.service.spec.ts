import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesService } from './activities.service';
import { ActivitiesRepository } from './activities.repository';
import { TripsService } from '../trips/trips.service';

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let activitiesRepository: jest.Mocked<ActivitiesRepository>;
  let tripsService: jest.Mocked<TripsService>;

  beforeEach(async () => {
    const mockActivitiesRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };
    const mockTripsService = {
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        {
          provide: ActivitiesRepository,
          useValue: mockActivitiesRepository,
        },
        {
          provide: TripsService,
          useValue: mockTripsService,
        },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
    activitiesRepository = module.get(ActivitiesRepository);
    tripsService = module.get(TripsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(activitiesRepository).toBeDefined();
    expect(tripsService).toBeDefined();
  });
});
