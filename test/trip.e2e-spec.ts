import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Database, DatabaseModule } from '../src/database.module';
import { setupDatabase } from './setup-db';
import { trips } from '../src/db-schema';
import { eq } from 'drizzle-orm';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let db: Database;
  let tearDownDbContainer: () => Promise<void>;
  let token: string;

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
    await app.init();

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'testuser@example.com',
        password: 'testpassword',
        name: 'Test User',
      });
    await db.insert(trips).values({
      name: 'Sample Trip',
      destination: 'Sample Destination',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-10'),
      isCompleted: false,
      userId: registerResponse.body.user.id, // eslint-disable-line
    });

    // eslint-disable-next-line
    token = registerResponse.body.accessToken;
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
    if (tearDownDbContainer) await tearDownDbContainer();
  });

  describe('POST /trip', () => {
    it('should create a new trip', async () => {
      const response = await request(app.getHttpServer())
        .post('/trip')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Holiday in Paris',
          destination: 'Paris',
          startDate: '2024-12-01',
          endDate: '2024-12-10',
        });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /trip', () => {
    it('should return all user trip', async () => {
      const response = await request(app.getHttpServer())
        .get('/trip')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('trips');
    });
  });

  describe('GET /trip/id', () => {
    it('should return trip data with given id', async () => {
      const response = await request(app.getHttpServer())
        .get('/trip/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Sample Trip');
    });
  });

  describe('PATCH /trip/id', () => {
    it('should update trip data with given id', async () => {
      const response = await request(app.getHttpServer())
        .patch('/trip/1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Sample Trip Updated',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Sample Trip Updated');
    });
  });

  describe('DELETE /trip/id', () => {
    it('should delete trip data with given id', async () => {
      const response = await request(app.getHttpServer())
        .delete('/trip/1')
        .set('Authorization', `Bearer ${token}`);
      const deletedTrips = await db.select().from(trips).where(eq(trips.id, 1));

      expect(response.status).toBe(200);
      expect(deletedTrips).toEqual([]);
    });
  });
});
