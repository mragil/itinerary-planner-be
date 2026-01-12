import { User } from '../../src/modules/users/users.schema';

export const createUser = (
  {
    id,
    email,
    password,
    name,
    createdAt,
    updatedAt,
    emailVerified,
  }: Partial<User>,
  MOCK_DATE = new Date('2026-01-11T20:00:00.000Z'),
) => ({
  id: id ?? 1,
  email: email ?? 'test@example.com',
  password: password ?? 'plain',
  name: name ?? 'Test',
  createdAt: createdAt ?? MOCK_DATE,
  updatedAt: updatedAt ?? createdAt ?? MOCK_DATE,
  emailVerified: emailVerified ?? false,
});
