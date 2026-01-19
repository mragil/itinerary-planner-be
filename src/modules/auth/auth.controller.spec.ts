import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { createUser } from '../../../test/fixtures/users';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  const mockResponse = {
    cookie: jest.fn(),
  } as unknown as import('express').Response;

  beforeEach(async () => {
    const mockAuthService = {
      validateUserCredentials: jest.fn(),
      registerUser: jest.fn(),
      refreshTokens: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should validate user credentials and return tokens', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      authService.validateUserCredentials.mockResolvedValue({
        accessToken: 'usertoken',
        refreshToken: 'refreshtoken',
      });

      const result = await controller.login(loginDto, mockResponse);

      expect(authService.validateUserCredentials).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'usertoken',
        refreshToken: 'refreshtoken',
      });
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test',
      };
      const user = createUser({});
      authService.registerUser.mockResolvedValue({
        user,
        accessToken: 'usertoken',
        refreshToken: 'refreshtoken',
      });

      const result = await controller.register(registerDto, mockResponse);

      expect(authService.registerUser).toHaveBeenCalledWith(registerDto);
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        user,
        accessToken: 'usertoken',
        refreshToken: 'refreshtoken',
      });
    });
  });
});
