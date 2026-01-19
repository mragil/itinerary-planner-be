import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new AuthGuard(jwtService, reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access to public routes', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalled();
  });

  it('should allow access with valid token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const mockRequest = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;

    jwtService.verifyAsync.mockResolvedValue({ sub: 1, email: 'test' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockRequest['user']).toEqual({ sub: 1, email: 'test' });
  });

  it('should throw UnauthorizedException if no token provided', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const mockRequest = {
      headers: {},
    };
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const mockRequest = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    };
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;

    jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token type is not Bearer', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const mockRequest = {
      headers: {
        authorization: 'Basic some-token',
      },
    };
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
  it('should return undefined if authorization header is malformed', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const mockRequest = {
      headers: {
        authorization: 'Bearer', // Missing token part
      },
    };
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should allow access with valid token from cookie', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const mockRequest = {
      headers: {},
      cookies: { accessToken: 'valid-cookie-token' },
    };
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;

    jwtService.verifyAsync.mockResolvedValue({ sub: 1, email: 'test' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-cookie-token');
    expect(mockRequest['user']).toEqual({ sub: 1, email: 'test' });
  });

  it('should prefer cookie token over header token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const mockRequest = {
      headers: { authorization: 'Bearer header-token' },
      cookies: { accessToken: 'cookie-token' },
    };
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;

    jwtService.verifyAsync.mockResolvedValue({ sub: 1, email: 'test' });

    await guard.canActivate(context);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('cookie-token');
  });
});
