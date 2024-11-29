import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { DataSource } from 'typeorm';

describe('HealthController', () => {
  let controller: HealthController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let healthCheckService: HealthCheckService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let typeOrmHealthIndicator: TypeOrmHealthIndicator;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockResolvedValue({ status: 'ok' }),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockResolvedValue({ status: 'ok' }),
          },
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    typeOrmHealthIndicator = module.get<TypeOrmHealthIndicator>(
      TypeOrmHealthIndicator,
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should return health check status', async () => {
    const result = await controller.check();
    expect(result).toEqual({ status: 'ok' });
  });
});
