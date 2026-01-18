import { currentUserFactory } from './current-user.decorators';
import { ExecutionContext } from '@nestjs/common';

describe('CurrentUser', () => {
  it('should return the current user when no data is provided', () => {
    const request = {
      user: {
        id: 1,
        email: 'test@test.com',
        username: 'test',
        role: 'user',
      },
    };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    const result = currentUserFactory(undefined, ctx);

    expect(result).toEqual(request.user);
  });

  it('should return the current user property when data is provided', () => {
    const request = {
      user: {
        id: 1,
        email: 'test@test.com',
        username: 'test',
        role: 'user',
        sub: '1',
      },
    };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    const result = currentUserFactory('sub', ctx);

    expect(result).toEqual(request.user.sub);
  });
});
