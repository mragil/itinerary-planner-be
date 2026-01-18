import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Database, DatabaseModule } from '../src/database.module';
import { setupDatabase } from './setup-db';
import { trips, activities } from '../src/db-schema';
import { eq } from 'drizzle-orm';

describe('ActivitiesController (e2e)', () => {
  let app: INestApplication<App>;
  let db: Database;
  let tearDownDbContainer: () => Promise<void>;
  let token: string;
  let tripId: number;

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

    const responseBody = registerResponse.body as {
      user: { id: number };
      accessToken: string;
    };
    const userId = responseBody.user.id;
    token = responseBody.accessToken;

    const [trip] = await db
      .insert(trips)
      .values({
        name: 'Sample Trip',
        destination: 'Sample Destination',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-10'),
        isCompleted: false,
        userId: userId,
      })
      .returning();
    tripId = trip.id;
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
    if (tearDownDbContainer) await tearDownDbContainer();
  });

  describe('POST /activities', () => {
    it('should create a new activity', async () => {
      const response = await request(app.getHttpServer())
        .post('/activities')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tripId: tripId,
          name: 'Visit Eiffel Tower',
          type: 'Sightseeing',
          location: 'Paris',
          startTime: '2024-12-02T10:00:00Z',
          endTime: '2024-12-02T12:00:00Z',
          cost: 200000,
          currency: 'IDR',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect((response.body as { name: string }).name).toBe(
        'Visit Eiffel Tower',
      );
    });
  });

  describe('PATCH /activities/:id', () => {
    it('should update activity', async () => {
      const [activity] = await db
        .insert(activities)
        .values({
          tripId: tripId,
          name: 'Old Activity',
          type: 'Food',
          location: 'Paris',
          startTime: new Date('2024-12-02T10:00:00Z'),
          endTime: new Date('2024-12-02T12:00:00Z'),
        })
        .returning();

      const response = await request(app.getHttpServer())
        .patch(`/activities/${activity.id}?tripId=${tripId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Activity',
        });

      expect(response.status).toBe(200);
      expect((response.body as { name: string }).name).toBe('Updated Activity');
    });
  });

  describe('DELETE /activities/:id', () => {
    it('should delete activity', async () => {
      const [activity] = await db
        .insert(activities)
        .values({
          tripId: tripId,
          name: 'To Delete',
          type: 'Food',
          location: 'Paris',
          startTime: new Date('2024-12-02T10:00:00Z'),
          endTime: new Date('2024-12-02T12:00:00Z'),
        })
        .returning();

      const response = await request(app.getHttpServer())
        .delete(`/activities/${activity.id}?tripId=${tripId}`)
        .set('Authorization', `Bearer ${token}`);
      const deleted = await db
        .select()
        .from(activities)
        .where(eq(activities.id, activity.id));

      expect(response.status).toBe(200);
      expect(deleted.length).toBe(0);
    });
  });
});
