import { Test, TestingModule } from '@nestjs/testing';
import { TripsRepository } from './trips.repository';
import { DatabaseModule, type Database } from '../../database.module';
import { NewTrip, Trip } from './trips.schema';
import { createTrip } from '../../../test/fixtures/trips';

type MockQueryBuilder = {
  from: jest.Mock;
  where: jest.Mock;
  values: jest.Mock;
  set: jest.Mock;
  returning: jest.Mock;
  findMany: jest.Mock;
  findFirst: jest.Mock;
};

type MockDatabase = Database &
  MockQueryBuilder & {
    query: {
      trips: {
        findMany: jest.Mock;
        findFirst: jest.Mock;
      };
    };
  };

describe('TripsRepository', () => {
  let repository: TripsRepository;
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
      query: {
        trips: {
          findMany: jest.fn(),
          findFirst: jest.fn(),
        },
      },
    } as unknown as jest.Mocked<Database>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsRepository,
        {
          provide: DatabaseModule.DB_TOKEN,
          useValue: mockedDb,
        },
      ],
    }).compile();

    repository = module.get<TripsRepository>(TripsRepository);
    mockDb = module.get(DatabaseModule.DB_TOKEN);
  });

  describe('findAll', () => {
    it('should return all trips for a user', async () => {
      const userId = 1;
      const trips: Trip[] = [
        createTrip({ id: 1, userId, name: 'Trip 1' }),
        createTrip({ id: 2, userId, name: 'Trip 2' }),
      ];
      mockDb.query.trips.findMany.mockResolvedValue(trips);

      const result = await repository.findAll(userId);

      expect(result).toEqual({ trips });
    });
  });

  describe('findById', () => {
    it('should return a trip by id and userId', async () => {
      const id = 1;
      const userId = 1;
      const trip = createTrip({ id, userId, name: 'Trip 1' });
      mockDb.query.trips.findFirst.mockResolvedValue({
        ...trip,
        activities: [],
      });

      const result = await repository.findById(id, userId);

      expect(result).toEqual({ ...trip, activities: [] });
      expect(mockDb.query.trips.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should return null if trip not found', async () => {
      mockDb.query.trips.findFirst.mockResolvedValue(undefined);

      const result = await repository.findById(1, 1);
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

      const result = await repository.create(newTrip as any, 1);

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

    it('should return null if not found', async () => {
      (mockDb.returning as jest.Mock).mockResolvedValue([]);
      const result = await repository.update(1, {}, 1);
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a trip', async () => {
      const id = 1;
      const userId = 1;
      const deleted = createTrip({
        id,
        userId,
        name: 'Deleted Trip',
      });
      (mockDb.returning as jest.Mock).mockResolvedValue([deleted]);

      const result = await repository.delete(id, userId);

      expect(result).toEqual(deleted);
      expect(mockDb.delete).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
      expect(mockDb.returning).toHaveBeenCalledTimes(1);
    });

    it('should return null if trip not found', async () => {
      (mockDb.returning as jest.Mock).mockResolvedValue([]);

      const result = await repository.delete(1, 1);
      expect(result).toBeNull();
    });
  });
});
