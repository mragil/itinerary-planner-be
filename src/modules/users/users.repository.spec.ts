import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { DatabaseModule, type Database } from '../../database.module';
import { createUser } from '../../../test/fixtures/users';

type MockQueryBuilder = {
  from: jest.Mock;
  where: jest.Mock;
  values: jest.Mock;
  set: jest.Mock;
  returning: jest.Mock;
};

type MockDatabase = Database &
  MockQueryBuilder & {
    query: {
      users: {
        findFirst: jest.Mock;
      };
    };
  };

describe('UsersRepository', () => {
  let repository: UsersRepository;
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
        users: {
          findFirst: jest.fn(),
        },
      },
    } as unknown as jest.Mocked<Database>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: DatabaseModule.DB_TOKEN,
          useValue: mockedDb,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    mockDb = module.get(DatabaseModule.DB_TOKEN);
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'test@example.com';
      const user = createUser({ email });
      mockDb.query.users.findFirst.mockResolvedValue(user);

      const result = await repository.findByEmail(email);

      expect(result).toEqual(user);
      expect(mockDb.query.users.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const newUser = {
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
      };
      const createdUser = createUser();
      const returningMock = jest
        .fn()
        .mockReturnValue(Promise.resolve([createdUser]));
      (mockDb.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: returningMock,
        }),
      });

      const result = await repository.create(newUser);

      expect(result).toEqual(createdUser);
    });
  });
});
