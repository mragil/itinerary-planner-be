import { LoggerMiddleware } from './logger.middleware';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;
  let loggerSpy: jest.SpyInstance;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    middleware = new LoggerMiddleware();
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    nextFunction = jest.fn();
    mockRequest = {
      method: 'GET',
      originalUrl: '/test',
      ip: '127.0.0.1',
    };
    mockResponse = {
      statusCode: 200,
      on: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should log request start', () => {
    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(loggerSpy).toHaveBeenCalledWith('GET /test - Start');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should log request completion on finish', () => {
    const onMock = jest.fn();
    mockResponse.on = onMock;

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    // Simulate response finish
    const finishCallback = onMock.mock.calls[0][1];
    finishCallback();

    expect(onMock).toHaveBeenCalledWith('finish', expect.any(Function));
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('[User: anonymous] GET /test 200'),
    );
  });

  it('should log user info if present', () => {
    const onMock = jest.fn();
    mockResponse.on = onMock;
    mockRequest['user'] = { sub: 123, email: 'user@test.com', name: 'User' };

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    const finishCallback = onMock.mock.calls[0][1];
    finishCallback();

    expect(loggerSpy).toHaveBeenNthCalledWith(1, 'GET /test - Start');
    expect(loggerSpy).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('[User: 123 - user@test.com] GET /test 200'),
    );
  });
});
