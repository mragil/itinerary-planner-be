import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { createUser } from '../../../test/fixtures/users';
import {
  InvalidCredentialsException,
  UserAlreadyExistsException,
} from './auth.exceptions';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      validateUser: jest.fn(),
    };
    const mockJwtService = {
      signAsync: jest.fn().mockReturnValue('mocked-jwt-token'),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password',
        name: 'John Doe',
      };
      const mockExistingUser = createUser(userData);
      usersService.findByEmail.mockResolvedValue(undefined);
      usersService.create.mockResolvedValue(mockExistingUser);

      const result = await service.registerUser(userData);

      expect(result).toEqual({
        accessToken: 'mocked-jwt-token',
        user: mockExistingUser,
      });
    });

    it('should throw UserAlreadyExistsException if user exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password',
        name: 'John Doe',
      };
      const mockExistingUser = createUser(userData);
      usersService.findByEmail.mockResolvedValue(mockExistingUser);

      await expect(service.registerUser(userData)).rejects.toThrow(
        UserAlreadyExistsException,
      );
    });
  });

  describe('validateUserCredentials', () => {
    it('should validate user credentials and return user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password',
        name: 'John Doe',
      };
      const mockExistingUser = createUser(userData);
      usersService.validateUser.mockResolvedValue(mockExistingUser);

      const result = await service.validateUserCredentials(
        userData.email,
        userData.password,
      );

      expect(result).toEqual({
        accessToken: 'mocked-jwt-token',
      });
    });

    it('should throw InvalidCredentialsException if email or password wrong', async () => {
      usersService.findByEmail.mockResolvedValue(undefined);

      await expect(
        service.validateUserCredentials('wrong@example.com', 'wrongpassword'),
      ).rejects.toThrow(InvalidCredentialsException);
    });
  });
});
