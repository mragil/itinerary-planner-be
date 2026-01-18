import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Database, DatabaseModule } from '../src/database.module';
import { setupDatabase } from './setup-db';
import { trips } from '../src/db-schema';
import { eq } from 'drizzle-orm';

describe('TripsController (e2e)', () => {
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
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
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

  describe('POST /trips', () => {
    it('should create a new trip', async () => {
      const response = await request(app.getHttpServer())
        .post('/trips')
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

  describe('GET /trips', () => {
    it('should return all user trip', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('trips');
    });
  });

  describe('GET /trips/id', () => {
    it('should return trip data with given id', async () => {
      const response = await request(app.getHttpServer())
        .get('/trips/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Sample Trip');
      expect(response.body).toHaveProperty('activities', []);
    });
  });

  describe('PATCH /trips/id', () => {
    it('should update trip data with given id', async () => {
      const response = await request(app.getHttpServer())
        .patch('/trips/1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Sample Trip Updated',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Sample Trip Updated');
    });
  });

  describe('DELETE /trips/id', () => {
    it('should delete trip data with given id', async () => {
      const response = await request(app.getHttpServer())
        .delete('/trips/1')
        .set('Authorization', `Bearer ${token}`);
      const deletedTrips = await db.select().from(trips).where(eq(trips.id, 1));

      expect(response.status).toBe(200);
      expect(deletedTrips).toEqual([]);
    });
  });
});
