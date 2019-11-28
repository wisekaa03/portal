/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/common';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LoggerModule, LogService } from '@app/logger';
import { NewsService } from './news.service';
// import { NewsEntity } from './news.entity';
// #endregion

// jest.mock('@nestjs/typeorm/dist/typeorm.module');
jest.mock('@app/ldap/ldap.service');
jest.mock('../guards/gqlauth.guard');
jest.mock('@app/config/config.service');

describe('NewsService', () => {
  let service: NewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule, ConfigModule.register('.env'), HttpModule],
      providers: [NewsService],
    }).compile();

    service = module.get<NewsService>(NewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
