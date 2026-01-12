import { Injectable } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { InvalidCredentialsException, UserAlreadyExistsException } from './auth.exceptions';

@Injectable()
export class AuthService {
  constructor(private readonly UserService: UsersService) {}

  async registerUser(userData: {
    email: string;
    password: string;
    name: string;
  }) {
    const isExistingUser = await this.UserService.findByEmail(userData.email);
    if (isExistingUser) {
      throw new UserAlreadyExistsException(userData.email);
    }
    return this.UserService.createUser(userData);
  }

  async validateUserCredentials(email: string, password: string) {
    const user = await this.UserService.validateUser(email, password);
    if (!user) {
      throw new InvalidCredentialsException();
    } 
    return user;
  }
}
