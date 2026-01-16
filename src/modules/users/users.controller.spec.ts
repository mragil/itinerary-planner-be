import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { createUser } from '../../../test/fixtures/users';

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
    const mockUser = createUser();
    userService.findByEmail.mockResolvedValue(mockUser);

    const result = await controller.findUserByEmail(mockUser.email);

    expect(result).toEqual(mockUser);
  });
});
