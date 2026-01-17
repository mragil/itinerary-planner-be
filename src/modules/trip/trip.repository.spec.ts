import { Test, TestingModule } from '@nestjs/testing';
import { TripRepository } from './trip.repository';
import { DatabaseModule, type Database } from '../../database.module';
import { NewTrip, Trip } from './trip.schema';
import { createTrip } from '../../../test/fixtures/trips';

type MockQueryBuilder = {
  from: jest.Mock;
  where: jest.Mock;
  values: jest.Mock;
  set: jest.Mock;
  returning: jest.Mock;
};

type MockDatabase = Database & MockQueryBuilder;

describe('TripRepository', () => {
  let repository: TripRepository;
  let mockDb: jest.Mocked<MockDatabase>;

  beforeEach(async () => {
    const mockedDb = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      execute: jest.fn(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      returning: jest.fn(),
    } as unknown as jest.Mocked<Database>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripRepository,
        {
          provide: DatabaseModule.DB_TOKEN,
          useValue: mockedDb,
        },
      ],
    }).compile();

    repository = module.get<TripRepository>(TripRepository);
    mockDb = module.get(DatabaseModule.DB_TOKEN);
  });

  describe('getAll', () => {
    it('should return all trips for a user', async () => {
      const userId = 1;
      const trips: Trip[] = [
        createTrip({ id: 1, userId, name: 'Trip 1' }),
        createTrip({ id: 2, userId, name: 'Trip 2' }),
      ];
      (mockDb.where as jest.Mock).mockResolvedValue(trips);

      const result = await repository.getAll(userId);

      expect(result).toEqual(trips);
    });
  });

  describe('getById', () => {
    it('should return a trip by id and userId', async () => {
      const id = 1;
      const userId = 1;
      const trip = createTrip({ id, userId, name: 'Trip 1' });
      (mockDb.execute as jest.Mock).mockResolvedValue({ rows: [trip] });

      const result = await repository.getById(id, userId);

      expect(result).toEqual({ ...trip, activities: [] });
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });

    it('should return null if trip not found', async () => {
      (mockDb.execute as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await repository.getById(1, 1);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new trip', async () => {
      const newTrip: NewTrip = {
        userId: 1,
        name: 'New Trip',
        destination: 'Tokyo',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-10'),
        isCompleted: false,
      };
      const created = createTrip({
        id: 1,
        ...newTrip,
      });
      (mockDb.returning as jest.Mock).mockResolvedValue([created]);

      const result = await repository.create(newTrip);

      expect(result).toEqual(created);
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(mockDb.values).toHaveBeenCalledTimes(1);
      expect(mockDb.returning).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a trip', async () => {
      const id = 1;
      const userId = 1;
      const updateData: Partial<Trip> = { name: 'Updated Trip' };
      const updated = createTrip({
        id,
        userId,
        name: 'Updated Trip',
      });
      (mockDb.returning as jest.Mock).mockResolvedValue([updated]);

      const result = await repository.update(id, updateData, userId);

      expect(result).toEqual(updated);
      expect(mockDb.update).toHaveBeenCalledTimes(1);
      expect(mockDb.set).toHaveBeenCalledWith(updateData);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
      expect(mockDb.returning).toHaveBeenCalledTimes(1);
    });

    it('should return null if no fields to update', async () => {
      const result = await repository.update(1, {}, 1);

      expect(result).toEqual(null);
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should update multiple fields', async () => {
      const id = 1;
      const userId = 1;
      const updateData: Partial<Trip> = {
        name: 'Updated Trip',
        destination: 'London',
        isCompleted: true,
      };
      const updated = createTrip({
        id,
        userId,
        ...updateData,
      });
      (mockDb.returning as jest.Mock).mockResolvedValue([updated]);

      const result = await repository.update(id, updateData, userId);

      expect(result).toEqual(updated);
      expect(mockDb.update).toHaveBeenCalledTimes(1);
      expect(mockDb.set).toHaveBeenCalledWith(updateData);
    });
  });

  describe('remove', () => {
    it('should delete a trip', async () => {
      const id = 1;
      const userId = 1;
      const deleted = createTrip({
        id,
        userId,
        name: 'Deleted Trip',
      });
      (mockDb.returning as jest.Mock).mockResolvedValue([deleted]);

      const result = await repository.remove(id, userId);

      expect(result).toEqual(deleted);
      expect(mockDb.delete).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
      expect(mockDb.returning).toHaveBeenCalledTimes(1);
    });

    it('should return null if trip not found', async () => {
      (mockDb.returning as jest.Mock).mockResolvedValue([]);

      const result = await repository.remove(1, 1);

      expect(result).toEqual(null);
      expect(mockDb.delete).toHaveBeenCalledTimes(1);
    });
  });
});
