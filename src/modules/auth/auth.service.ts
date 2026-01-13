import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import {
  InvalidCredentialsException,
  UserAlreadyExistsException,
} from './auth.exceptions';
import { access } from 'fs';
import { TokenPayload } from '../app.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(userData: {
    email: string;
    password: string;
    name: string;
  }) {
    const isExistingUser = await this.userService.findByEmail(userData.email);
    if (isExistingUser) {
      throw new UserAlreadyExistsException(userData.email);
    }
    const user = await this.userService.createUser(userData);
    const payload = { sub: user.id, email: user.email, name: user.name };
    const token = await this.jwtService.signAsync(payload);
    return { accessToken: token, user };
  }

  async validateUserCredentials(email: string, password: string) {
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new InvalidCredentialsException();
    }
    const payload: TokenPayload = { sub: user.id, email: user.email, name: user.name };
    const token = await this.jwtService.signAsync(payload);

    return {
      accessToken: token,
    };
  }
}
