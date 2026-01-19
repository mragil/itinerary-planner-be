import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { TripsRepository } from './trips.repository';
import { createTrip } from '../../../test/fixtures/trips';
import { NotFoundException } from '@nestjs/common';

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

  describe('create', () => {
    it('should create a new trip', async () => {
      const createTripDto = {
        name: 'Paris Trip',
        destination: 'Paris',
        startDate: new Date(),
        endDate: new Date(),
      };
      const trip = createTrip(createTripDto);
      tripRepository.create.mockResolvedValue(trip);

      const result = await service.create(createTripDto, 1);

      expect(tripRepository.create).toHaveBeenCalledWith(createTripDto, 1);
      expect(result).toBe(trip);
    });
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
      tripRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a trip', async () => {
      const trip = createTrip({});
      tripRepository.update.mockResolvedValue(trip);

      expect(await service.update(1, trip, 1)).toBe(trip);
    });

    it('should throw an error if trip not found', async () => {
      tripRepository.update.mockResolvedValue(null);

      await expect(service.update(1, {}, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a trip', async () => {
      const trip = createTrip({});
      tripRepository.delete.mockResolvedValue(trip);

      expect(await service.remove(1, 1)).toBe(trip);
    });

    it('should throw an error if trip not found', async () => {
      tripRepository.delete.mockResolvedValue(null);

      await expect(service.remove(1, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
