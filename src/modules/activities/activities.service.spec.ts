import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesService } from './activities.service';
import { ActivitiesRepository } from './activities.repository';
import { TripsService } from '../trips/trips.service';
import { createActivity } from '../../../test/fixtures/activities';
import { HttpException, NotFoundException } from '@nestjs/common';
import { createTrip } from '../../../test/fixtures/trips';

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

  describe('create', () => {
    it('should create an activity successfully', async () => {
      const activityDto = createActivity();
      const userId = 1;
      tripsService.findOne.mockResolvedValue(
        createTrip({ id: activityDto.tripId, userId }),
      );
      activitiesRepository.create.mockResolvedValue(activityDto);

      const result = await service.create(activityDto as any, userId);

      expect(tripsService.findOne).toHaveBeenCalledWith(
        activityDto.tripId,
        userId,
      );
      expect(activitiesRepository.create).toHaveBeenCalled();
      expect(result).toEqual(activityDto);
    });

    it('should throw NotFoundException if trip not found', async () => {
      const activityDto = createActivity();
      const userId = 1;
      tripsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.create(activityDto as any, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all activities for a trip', async () => {
      const tripId = 1;
      const userId = 1;
      const activities = [createActivity()];
      tripsService.findOne.mockResolvedValue(
        createTrip({ id: tripId, userId }),
      );
      activitiesRepository.findAll.mockResolvedValue(activities);

      const result = await service.findAll(tripId, userId);

      expect(tripsService.findOne).toHaveBeenCalledWith(tripId, userId);
      expect(activitiesRepository.findAll).toHaveBeenCalledWith(tripId);
      expect(result).toEqual({ activities });
    });

    it('should throw NotFoundException if trip not found', async () => {
      const tripId = 1;
      const userId = 1;
      tripsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.findAll(tripId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an activity successfully', async () => {
      const fixedDate = new Date('2026-01-01T10:00:00Z');
      const updateDto = { name: 'Updated' };
      const userId = 1;
      const tripId = 1;
      const activityId = 1;
      const mockActivity = createActivity({
        ...updateDto,
        startTime: fixedDate,
        endTime: fixedDate,
      });

      tripsService.findOne.mockResolvedValue(
        createTrip({ id: tripId, userId }),
      );
      activitiesRepository.update.mockResolvedValue(mockActivity);

      const result = await service.update(
        activityId,
        updateDto,
        userId,
        tripId,
      );

      expect(tripsService.findOne).toHaveBeenCalledWith(tripId, userId);
      expect(activitiesRepository.update).toHaveBeenCalledWith(
        activityId,
        updateDto,
        tripId,
      );
      expect(result).toEqual(mockActivity);
    });

    it('should throw NotFoundException if trip not found', async () => {
      tripsService.findOne.mockRejectedValue(new NotFoundException());
      await expect(service.update(1, {}, 1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException (404) if activity not found', async () => {
      const userId = 1;
      const tripId = 1;
      tripsService.findOne.mockResolvedValue(
        createTrip({ id: tripId, userId }),
      );
      activitiesRepository.update.mockResolvedValue(null);

      await expect(service.update(1, {}, userId, tripId)).rejects.toThrow(
        new HttpException('Activity not found', 404),
      );
    });
  });

  describe('remove', () => {
    it('should remove an activity successfully', async () => {
      const fixedDate = new Date('2026-01-01T10:00:00Z');
      const userId = 1;
      const tripId = 1;
      const activityId = 1;
      const mockActivity = createActivity({
        startTime: fixedDate,
        endTime: fixedDate,
      });

      tripsService.findOne.mockResolvedValue(
        createTrip({ id: tripId, userId }),
      );
      activitiesRepository.delete.mockResolvedValue(mockActivity);

      const result = await service.remove(activityId, tripId, userId);

      expect(tripsService.findOne).toHaveBeenCalledWith(tripId, userId);
      expect(activitiesRepository.delete).toHaveBeenCalledWith(
        activityId,
        tripId,
      );
      expect(result).toEqual(mockActivity);
    });

    it('should throw NotFoundException if trip not found', async () => {
      tripsService.findOne.mockRejectedValue(new NotFoundException());
      await expect(service.remove(1, 1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException (404) if activity not found', async () => {
      const userId = 1;
      const tripId = 1;
      tripsService.findOne.mockResolvedValue(
        createTrip({ id: tripId, userId }),
      );
      activitiesRepository.delete.mockResolvedValue(null);

      await expect(service.remove(1, tripId, userId)).rejects.toThrow(
        new HttpException('Activity not found', 404),
      );
    });
  });
});
