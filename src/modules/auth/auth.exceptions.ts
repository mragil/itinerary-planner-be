import { HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsException extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists.`);
    this.name = 'UserAlreadyExistsException';
  }

  getStatusCode(): number {
    return HttpStatus.BAD_REQUEST;
  }
}

export class InvalidCredentialsException extends Error {
  constructor() {
    super('Invalid email or password.');
    this.name = 'InvalidCredentialsException';
  }

  getStatusCode(): number {
    return HttpStatus.BAD_REQUEST;
  }
}
