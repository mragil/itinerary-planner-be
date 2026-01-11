import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './users.repository';

jest.mock('bcrypt', () => ({
  hash: jest.fn((password: string) => `hashed-${password}`),
  compare: jest.fn(
    (password: string, hashed: string) => hashed === `hashed-${password}`,
  ),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<UserRepository>;
  const MOCK_DATE = new Date('2026-01-11T20:00:00.000Z');

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_DATE);

    const mockRepository = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(UserRepository);
  });

  it('should register user', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'plain',
      name: 'Test',
      createdAt: MOCK_DATE,
      updatedAt: MOCK_DATE,
      emailVerified: false,
    };
    userRepository.createUser.mockResolvedValue(mockUser);

    const result = await service.createUser({
      email: 'test@example.com',
      password: 'plain',
      name: 'Test',
    });

    expect(result).toEqual(mockUser);
    expect(userRepository.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'hashed-plain',
      name: 'Test',
    });
  });
});
