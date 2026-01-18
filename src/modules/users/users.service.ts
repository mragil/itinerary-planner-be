import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { UsersRepository } from './users.repository';
import { type NewUser } from './users.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async create(userData: NewUser) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    return this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
}
