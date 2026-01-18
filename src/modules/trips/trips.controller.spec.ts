import { Test, TestingModule } from '@nestjs/testing';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { createTrip } from '../../../test/fixtures/trips';

describe('TripsController', () => {
  let controller: TripsController;
  let tripsService: jest.Mocked<TripsService>;

  beforeEach(async () => {
    const mockTripsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripsController],
      providers: [
        TripsService,
        { provide: TripsService, useValue: mockTripsService },
      ],
    }).compile();

    controller = module.get<TripsController>(TripsController);
    tripsService = module.get(TripsService);
  });

  describe('create', () => {
    it('should create a trip', async () => {
      const createTripDto = {
        name: 'Trip 1',
        destination: 'Paris',
        startDate: new Date(),
        endDate: new Date(),
      };
      const userId = 1;
      const expectedResult = createTrip({
        id: 1,
        ...createTripDto,
        userId,
      });

      tripsService.create.mockResolvedValue(expectedResult);

      expect(await controller.create(createTripDto, userId)).toBe(
        expectedResult,
      );
      expect(tripsService.create).toHaveBeenCalledWith(createTripDto, userId);
    });
  });

  describe('findAll', () => {
    it('should return an array of trips', async () => {
      const userId = 1;
      const expectedResult = { trips: [] };

      tripsService.findAll.mockResolvedValue(expectedResult);

      expect(await controller.findAll(userId)).toBe(expectedResult);
      expect(tripsService.findAll).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOne', () => {
    it('should return a single trip', async () => {
      const id = '1';
      const userId = 1;
      const expectedResult = createTrip({ id: 1, userId });
      const mockResultWithActivities = { ...expectedResult, activities: [] };

      tripsService.findOne.mockResolvedValue(mockResultWithActivities);

      expect(await controller.findOne(id, userId)).toBe(
        mockResultWithActivities,
      );
      expect(tripsService.findOne).toHaveBeenCalledWith(+id, userId);
    });
  });

  describe('update', () => {
    it('should update a trip', async () => {
      const id = '1';
      const userId = 1;
      const updateTripDto = { name: 'Updated Trip' };
      const expectedResult = createTrip({ id: 1, ...updateTripDto, userId });

      tripsService.update.mockResolvedValue(expectedResult);

      expect(await controller.update(id, updateTripDto, userId)).toBe(
        expectedResult,
      );
      expect(tripsService.update).toHaveBeenCalledWith(
        +id,
        updateTripDto,
        userId,
      );
    });
  });

  describe('remove', () => {
    it('should remove a trip', async () => {
      const id = '1';
      const userId = 1;
      const expectedResult = createTrip({ id: 1, userId });

      tripsService.remove.mockResolvedValue(expectedResult);

      expect(await controller.remove(id, userId)).toBe(expectedResult);
      expect(tripsService.remove).toHaveBeenCalledWith(+id, userId);
    });
  });
});
