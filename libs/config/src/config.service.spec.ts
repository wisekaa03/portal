/** @format */

// #region Imports NPM
import { join } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { ConfigService } from './config.service';
// #endregion

describe(ConfigService.name, () => {
  let config: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: new ConfigService(join(process.cwd(), '.env.example')),
        },
      ],
    }).compile();

    config = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(config).toBeDefined();
  });
});
