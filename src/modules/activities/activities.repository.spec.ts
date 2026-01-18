import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesRepository } from './activities.repository';
import { NewActivity } from './activities.schema';
import { DatabaseModule, type Database } from '../../database.module';
import { createActivity } from '../../../test/fixtures/activities';

type MockQueryBuilder = {
  select: jest.Mock;
  from: jest.Mock;
  where: jest.Mock;
  insert: jest.Mock;
  values: jest.Mock;
  returning: jest.Mock;
  update: jest.Mock;
  set: jest.Mock;
  delete: jest.Mock;
};

type MockDatabase = Database & MockQueryBuilder;

describe('ActivitiesRepository', () => {
  let repository: ActivitiesRepository;
  let mockDb: jest.Mocked<MockDatabase>;

  beforeEach(async () => {
    const mockedDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Database>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesRepository,
        {
          provide: DatabaseModule.DB_TOKEN,
          useValue: mockedDb,
        },
      ],
    }).compile();

    repository = module.get<ActivitiesRepository>(ActivitiesRepository);
    mockDb = module.get(DatabaseModule.DB_TOKEN);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all activities for a trip', async () => {
      const mockActivities = [createActivity(), createActivity({ id: 2 })];
      (mockDb.where as jest.Mock).mockResolvedValue(mockActivities);

      const result = await repository.findAll(1);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(result).toEqual(mockActivities);
    });
  });

  describe('create', () => {
    it('should create and return a new activity', async () => {
      const newActivity = createActivity();
      (mockDb.returning as jest.Mock).mockResolvedValue([newActivity]);

      const result = await repository.create(newActivity);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
      expect(result).toEqual(newActivity);
    });

    it('should handle missing optional fields', async () => {
      const activityWithoutOptionals: NewActivity = {
        name: 'Test Activity',
        type: 'Activity',
        location: 'Test Location',
        startTime: new Date(),
        endTime: new Date(),
        currency: 'USD',
        isCompleted: false,
        tripId: 1,
        // notes and cost implicitly undefined
      };

      const expectedActivity = {
        ...activityWithoutOptionals,
        id: 1,
        notes: null,
        cost: null,
      };

      (mockDb.returning as jest.Mock).mockResolvedValue([expectedActivity]);

      await repository.create(activityWithoutOptionals);

      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: null,
          cost: null,
        }),
      );
    });
  });

  describe('update', () => {
    it('should update and return the activity', async () => {
      const updatedActivity = createActivity({ name: 'Updated Name' });
      (mockDb.returning as jest.Mock).mockResolvedValue([updatedActivity]);

      const result = await repository.update(1, { name: 'Updated Name' }, 1);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
      expect(result).toEqual(updatedActivity);
    });

    it('should return null if activity not found', async () => {
      (mockDb.returning as jest.Mock).mockResolvedValue([]);

      const result = await repository.update(999, { name: 'Updated Name' }, 1);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete and return the activity', async () => {
      const deletedActivity = createActivity();
      (mockDb.returning as jest.Mock).mockResolvedValue([deletedActivity]);

      const result = await repository.delete(1, 1);

      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
      expect(result).toEqual(deletedActivity);
    });

    it('should return null if activity not found', async () => {
      (mockDb.returning as jest.Mock).mockResolvedValue([]);

      const result = await repository.delete(999, 1);

      expect(result).toBeNull();
    });
  });
});
