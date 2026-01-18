import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { TripsRepository } from './trips.repository';
import { createTrip } from '../../../test/fixtures/trips';

describe('TripsService', () => {
  let service: TripsService;
  let tripRepository: jest.Mocked<TripsRepository>;

  beforeEach(async () => {
    const mockTripRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        { provide: TripsRepository, useValue: mockTripRepository },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    tripRepository = module.get(TripsRepository);
  });

  describe('findAll', () => {
    it('should return an array of trips', async () => {
      const result = { trips: [createTrip({})] };
      tripRepository.findAll.mockResolvedValue(result);

      expect(await service.findAll(1)).toBe(result);
    });
  });

  describe('findById', () => {
    it('should return a trip', async () => {
      const trip = { ...createTrip({}), activities: [] };
      tripRepository.findById.mockResolvedValue(trip);

      expect(await service.findOne(1, 1)).toBe(trip);
    });

    it('should throw an error if trip not found', async () => {
      tripRepository.findById.mockRejectedValue(new Error('Trip not found'));

      await expect(service.findOne(1, 1)).rejects.toThrow('Trip not found');
    });
  });

  describe('update', () => {
    it('should update a trip', async () => {
      const trip = createTrip({});
      tripRepository.update.mockResolvedValue(trip);

      expect(await service.update(1, trip, 1)).toBe(trip);
    });

    it('should throw an error if trip not found', async () => {
      tripRepository.update.mockRejectedValue(new Error('Trip not found'));

      await expect(service.update(1, {}, 1)).rejects.toThrow('Trip not found');
    });
  });

  describe('delete', () => {
    it('should delete a trip', async () => {
      const trip = createTrip({});
      tripRepository.delete.mockResolvedValue(trip);

      expect(await service.remove(1, 1)).toBe(trip);
    });

    it('should throw an error if trip not found', async () => {
      tripRepository.delete.mockRejectedValue(new Error('Trip not found'));

      await expect(service.remove(1, 1)).rejects.toThrow('Trip not found');
    });
  });
});
