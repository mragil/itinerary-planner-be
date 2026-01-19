import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { Database, DatabaseModule } from '../src/database.module';
import { setupDatabase } from './setup-db';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let db: Database;
  let tearDownDbContainer: () => Promise<void>;

  beforeAll(async () => {
    const { testDb, tearDownDb } = await setupDatabase();
    db = testDb;
    tearDownDbContainer = tearDownDb;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseModule.DB_TOKEN)
      .useValue(db)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
    if (tearDownDbContainer) await tearDownDbContainer();
  });

  describe('POST /auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'testuser@example.com',
          password: 'testpassword',
          name: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user', {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: expect.any(Number),
        email: 'testuser@example.com',
        name: 'Test User',
        emailVerified: false,
        roles: ['user'],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        createdAt: expect.any(String),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        updatedAt: expect.any(String),
      });
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'testuser2@example.com',
        password: 'testpassword',
        name: 'Test User',
      });
    });

    it('should login and return tokens with cookies', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'testuser2@example.com',
          password: 'testpassword',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('POST /auth/refresh', () => {
    let cookies: string[];

    beforeAll(async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'testuser3@example.com',
        password: 'testpassword',
        name: 'Test User 3',
      });
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'testuser3@example.com', password: 'testpassword' });
      cookies = loginResponse.headers['set-cookie'] as unknown as string[];
    });

    it('should refresh tokens using cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should fail without refresh token cookie', async () => {
      const response = await request(app.getHttpServer()).post('/auth/refresh');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear cookies on logout', async () => {
      const response = await request(app.getHttpServer()).post('/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Logged out' });
    });
  });
});
