import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { createActivity } from '../../../test/fixtures/activities';

describe('ActivitiesController', () => {
  let controller: ActivitiesController;
  let activitiesService: jest.Mocked<ActivitiesService>;

  beforeEach(async () => {
    const mockActivitiesService = {
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [
        {
          provide: ActivitiesService,
          useValue: mockActivitiesService,
        },
      ],
    }).compile();

    controller = module.get<ActivitiesController>(ActivitiesController);
    activitiesService = module.get(ActivitiesService);
  });

  describe('create', () => {
    it('should create an activity', async () => {
      const activity = createActivity();
      activitiesService.create.mockResolvedValue(activity);

      const result = await controller.create(activity, 1);

      expect(result).toEqual(activity);
    });
  });

  describe('update', () => {
    it('should update an activity', async () => {
      const activity = createActivity();
      activitiesService.update.mockResolvedValue(activity);

      const result = await controller.update(
        activity.id,
        activity.tripId,
        activity,
        1,
      );

      expect(result).toEqual(activity);
    });
  });

  describe('remove', () => {
    it('should remove an activity', async () => {
      const activity = createActivity();
      activitiesService.remove.mockResolvedValue(activity);

      const result = await controller.remove(activity.id, activity.tripId, 1);

      expect(result).toEqual(activity);
    });
  });
});
