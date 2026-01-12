import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NewUser, users, usersWithoutPassword } from './users.schema';
import { DatabaseModule, type Database } from '../../database.module';

@Injectable()
export class UserRepository {
  constructor(
    @Inject(DatabaseModule.DB_TOKEN)
    private readonly db: Database,
  ) {}

  async findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async createUser(userData: NewUser) {
    return this.db
      .insert(users)
      .values({
        email: userData.email,
        password: userData.password,
        name: userData.name,
      })
      .returning(usersWithoutPassword)
      .then((result) => result[0]);
  }
}
