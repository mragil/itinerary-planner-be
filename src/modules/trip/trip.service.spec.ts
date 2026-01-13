import { Test, TestingModule } from '@nestjs/testing';
import { TripService } from './trip.service';
import { TripRepository } from './trip.repository';

describe('TripService', () => {
  let service: TripService;
  let tripRepository: jest.Mocked<TripRepository>;

  beforeEach(async () => {
    const mockTripRepository = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        { provide: TripRepository, useValue: mockTripRepository },
      ],
    }).compile();

    service = module.get<TripService>(TripService);
    tripRepository = module.get(TripRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(tripRepository).toBeDefined();
  });
});
