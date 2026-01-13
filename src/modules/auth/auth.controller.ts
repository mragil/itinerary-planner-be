import {
  Body,
  Controller,
  Post,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../../decorators/public.decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.validateUserCredentials(
      loginDto.email,
      loginDto.password,
    );
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.registerUser(registerDto);
  }
}
