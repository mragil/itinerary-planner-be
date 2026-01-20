import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import {
  InvalidCredentialsException,
  UserAlreadyExistsException,
} from './auth.exceptions';
import { TokenPayload } from '../app.types';
import { User } from '../users/users.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
    const user = await this.userService.create(userData);

    return this.generateTokens(user);
  }

  async validateUserCredentials(email: string, password: string) {
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    return this.generateTokens(user);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(
        refreshToken,
        { secret: this.configService.getOrThrow('JWT_REFRESH_SECRET') },
      );
      const user = await this.userService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException();
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: Omit<User, 'password'>) {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
