/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { LogService } from './log.service';
// #endregion

describe(LogService.name, () => {
  let service: LogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRootAsync({
          useFactory: async () => {
            return {
              pinoHttp: {
                prettyPrint: true,
                level: 'debug',
              },
            };
          },
        }),
      ],
      providers: [{ provide: 'pino-params', useValue: {} }, LogService],
    }).compile();

    service = await module.resolve<LogService>(LogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
