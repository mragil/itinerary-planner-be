import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
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
      signAsync: jest.fn().mockResolvedValue('mocked-jwt-token'),
    };
    const mockConfigService = {
      getOrThrow: jest.fn().mockReturnValue('secret'),
      get: jest.fn().mockReturnValue('7d'),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
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
        refreshToken: 'mocked-jwt-token',
        user: {
          email: mockExistingUser.email,
          name: mockExistingUser.name,
          id: mockExistingUser.id,
        },
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
    it('should validate user credentials and return tokens', async () => {
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
        refreshToken: 'mocked-jwt-token',
        user: {
          email: mockExistingUser.email,
          name: mockExistingUser.name,
          id: mockExistingUser.id,
        },
      });
    });

    it('should throw InvalidCredentialsException if email or password wrong', async () => {
      usersService.findByEmail.mockResolvedValue(undefined);

      await expect(
        service.validateUserCredentials('wrong@example.com', 'wrongpassword'),
      ).rejects.toThrow(InvalidCredentialsException);
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens with valid refresh token', async () => {
      const mockUser = createUser({});
      const jwtService = service['jwtService'] as jest.Mocked<JwtService>;
      jwtService.verifyAsync = jest.fn().mockResolvedValue({
        sub: 1,
        email: 'test@example.com',
        name: 'Test',
      });
      usersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result).toEqual({
        accessToken: 'mocked-jwt-token',
        refreshToken: 'mocked-jwt-token',
        user: {
          email: mockUser.email,
          name: mockUser.name,
          id: mockUser.id,
        },
      });
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const jwtService = service['jwtService'] as jest.Mocked<JwtService>;
      jwtService.verifyAsync = jest
        .fn()
        .mockRejectedValue(new Error('Invalid'));

      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const jwtService = service['jwtService'] as jest.Mocked<JwtService>;
      jwtService.verifyAsync = jest.fn().mockResolvedValue({
        sub: 1,
        email: 'deleted@example.com',
        name: 'Deleted',
      });
      usersService.findByEmail.mockResolvedValue(undefined);

      await expect(service.refreshTokens('valid-token')).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });
});
