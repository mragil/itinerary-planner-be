import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception-filter';
import { Request, Response } from 'express';

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockHttpArgumentsHost: any;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    filter = new DomainExceptionFilter();
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;
    mockRequest = {
      url: '/test-url',
    };
    mockHttpArgumentsHost = {
      getResponse: jest.fn().mockReturnValue(mockResponse),
      getRequest: jest.fn().mockReturnValue(mockRequest),
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
    } as unknown as ArgumentsHost;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException correctly', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockArgumentsHost);

    expect(mockHttpArgumentsHost.getResponse).toHaveBeenCalled();
    expect(mockHttpArgumentsHost.getRequest).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: HttpStatus.FORBIDDEN,
      timestamp: expect.any(String),
      path: '/test-url',
      message: 'Forbidden',
    });
  });

  it('should handle unknown exceptions as Internal Server Error', () => {
    const exception = new Error('Unexpected error');

    filter.catch(exception, mockArgumentsHost);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
      path: '/test-url',
      message: 'Internal server error',
    });
  });

  it('should extract message from object response', () => {
    const exception = new HttpException(
      { message: 'Custom message', error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Custom message',
      }),
    );
  });

  it('should use default message if response object has no message property', () => {
    const exception = new HttpException(
      { error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String),
      path: '/test-url',
      message: 'Http Exception',
    });
  });
});
