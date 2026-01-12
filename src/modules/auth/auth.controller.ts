import {
  Body,
  Controller,
  Post,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUserCredentials(
      loginDto.email,
      loginDto.password,
    );
    return `usertoken`; // Placeholder for actual token generation
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.registerUser(registerDto);
  }
}
