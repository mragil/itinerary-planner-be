import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { createUser } from '../../../test/fixtures/users';

jest.mock('bcrypt', () => ({
  hash: jest.fn((password: string) => `hashed-${password}`),
  compare: jest.fn(
    (password: string, hashed: string) => hashed === `hashed-${password}`,
  ),
}));

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<UsersRepository>;
  const MOCK_DATE = new Date('2026-01-11T20:00:00.000Z');

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_DATE);

    const mockRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(UsersRepository);
  });

  it('should register user', async () => {
    const mockUser = createUser({
      email: 'test@example.com',
      password: 'plain',
      name: 'Test',
    });
    usersRepository.create.mockResolvedValue(mockUser);

    const result = await service.create({
      email: 'test@example.com',
      password: 'plain',
      name: 'Test',
    });

    expect(result).toEqual(mockUser);
    expect(usersRepository.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'hashed-plain',
      name: 'Test',
    });
  });
});
