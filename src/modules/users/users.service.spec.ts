import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { createUser } from '../../../test/fixtures/users';
import * as bcrypt from 'bcrypt';

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

  it('should be instantiated', () => {
    const repo = { findByEmail: jest.fn(), create: jest.fn() } as any;
    const svc = new UsersService(repo);
    expect(svc).toBeDefined();
  });

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
  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const user = createUser();
      usersRepository.findByEmail.mockResolvedValue(user);

      const result = await service.findByEmail('test@example.com');

      expect(result).toBe(user);
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const user = createUser({ password: 'hashed-password' });
      usersRepository.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockReturnValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBe(user);
    });

    it('should return null if user not found', async () => {
      usersRepository.findByEmail.mockResolvedValue(undefined);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const user = createUser({ password: 'hashed-password' });
      usersRepository.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockReturnValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });
});
