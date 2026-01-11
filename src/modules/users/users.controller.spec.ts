import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let userService: jest.Mocked<UsersService>;
  const MOCK_DATE = new Date('2026-01-11T20:00:00.000Z');

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_DATE);
    const mockUserService = {
      createUser: jest.fn(),
      findByEmail: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get(UsersService);
  });

  it('should return user by email', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'plain',
      name: 'Test',
      createdAt: MOCK_DATE,
      updatedAt: MOCK_DATE,
      emailVerified: false,
    };
    userService.findByEmail.mockResolvedValue(mockUser);

    const result = await controller.findUserByEmail('test@example.com');

    expect(result).toEqual(mockUser);
  });
});
