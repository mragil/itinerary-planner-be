import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  async findUserByEmail(@Query('email') email: string) {
    return this.userService.findByEmail(email);
  }
}
