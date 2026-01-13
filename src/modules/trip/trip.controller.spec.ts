import { Test, TestingModule } from '@nestjs/testing';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';

describe('TripController', () => {
  let controller: TripController;
  let tripService: jest.Mocked<TripService>;

  beforeEach(async () => {
    const mockTripService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripController],
      providers: [
        TripService,
        { provide: TripService, useValue: mockTripService },
      ],
    }).compile();

    controller = module.get<TripController>(TripController);
    tripService = module.get(TripService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(tripService).toBeDefined();
  });
});
