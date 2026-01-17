import { Test, TestingModule } from '@nestjs/testing';
import { TripService } from './trip.service';
import { TripRepository } from './trip.repository';
import { createTrip } from '../../../test/fixtures/trips';

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

  describe('findAll', () => {
    it('should return an array of trips for the user', async () => {
      const userId = 1;
      const mockTrips = [
        createTrip({ id: 1, destination: 'New York', userId }),
        createTrip({ id: 2, destination: 'London', userId }),
      ];
      tripRepository.getAll.mockResolvedValue(mockTrips);

      const result = await service.findAll(userId);

      expect(result).toEqual({ trips: mockTrips });
      expect(tripRepository.getAll).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOne', () => {
    it('should return a trip if found', async () => {
      const userId = 1;
      const tripId = 1;
      const mockTrip = {
        ...createTrip({ id: tripId, destination: 'Paris', userId }),
        activities: [],
      };
      tripRepository.getById.mockResolvedValue(mockTrip);

      const result = await service.findOne(tripId, userId);

      expect(result).toEqual(mockTrip);
      expect(tripRepository.getById).toHaveBeenCalledWith(tripId, userId);
    });

    it('should throw an HttpException if trip not found', async () => {
      const userId = 1;
      const tripId = 999;
      tripRepository.getById.mockResolvedValue(null);

      await expect(service.findOne(tripId, userId)).rejects.toThrow(
        'Trip not found',
      );
      expect(tripRepository.getById).toHaveBeenCalledWith(tripId, userId);
    });
  });
});
