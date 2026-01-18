import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from '../modules/app.types';
import { Request } from 'express';

export const currentUserFactory = (
  data: keyof TokenPayload | undefined,
  ctx: ExecutionContext,
) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const user = request.user;
  return data ? user?.[data] : user;
};

export const CurrentUser = createParamDecorator(currentUserFactory);
