import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService, HealthIndicatorService } from '@nestjs/terminus';
import { DatabaseModule } from '../../database.module';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let healthIndicatorService: HealthIndicatorService;
  let dbMock: { execute: jest.Mock };

  beforeEach(async () => {
    dbMock = {
      execute: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest
              .fn()
              .mockImplementation((indicators: (() => Promise<any>)[]) => {
                // Execute the indicators
                return Promise.all(indicators.map((i) => i()));
              }),
          },
        },
        {
          provide: HealthIndicatorService,
          useValue: {
            check: jest.fn().mockReturnValue({
              up: jest.fn().mockReturnValue({
                database: { status: 'up' },
              }),
              down: jest.fn().mockReturnValue({
                database: { status: 'down', message: 'Connection failed' },
              }),
            }),
          },
        },
        {
          provide: DatabaseModule.DB_TOKEN,
          useValue: dbMock,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    healthIndicatorService = module.get<HealthIndicatorService>(
      HealthIndicatorService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should call healthCheckService.check', async () => {
      await controller.check();
      expect(healthCheckService.check).toHaveBeenCalled();
    });
  });

  describe('isDbHealthy', () => {
    it('should return up status when db is reachable', async () => {
      const result = await controller.isDbHealthy('database');
      expect(result).toEqual({
        database: {
          status: 'up',
        },
      });
      expect(dbMock.execute).toHaveBeenCalled();
      expect(healthIndicatorService.check).toHaveBeenCalledWith('database');
    });

    it('should return down status when db is not reachable', async () => {
      dbMock.execute.mockRejectedValue(new Error('Connection failed'));
      const result = await controller.isDbHealthy('database');
      expect(result).toEqual({
        database: {
          status: 'down',
          message: 'Connection failed',
        },
      });
    });
  });
});
