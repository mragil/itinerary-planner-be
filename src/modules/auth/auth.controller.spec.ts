import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { createUser } from '../../../test/fixtures/users';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      validateUserCredentials: jest.fn(),
      registerUser: jest.fn(),
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
  });

  describe('login', () => {
    it('should validate user credentials and return token', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      authService.validateUserCredentials.mockResolvedValue({
        accessToken: 'usertoken',
      });

      const token = await controller.login(loginDto);

      expect(authService.validateUserCredentials).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(token).toEqual({ accessToken: 'usertoken' });
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
      });

      const result = await controller.register(registerDto);

      expect(authService.registerUser).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({ user, accessToken: 'usertoken' });
    });
  });
});
