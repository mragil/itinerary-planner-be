import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { UserRepository } from './users.repository';
import { type NewUser } from './users.schema';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async createUser(userData: NewUser) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    return this.userRepository.createUser({
      ...userData,
      password: hashedPassword,
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
}
