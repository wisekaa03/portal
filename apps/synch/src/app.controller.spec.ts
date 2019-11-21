/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { LoggerModule } from '@app/logger';
import { ConfigModule } from '@app/config';
import { LdapModule, LdapModuleOptions } from '@app/ldap';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../../portal/src/user/user.module';
// #endregion

jest.mock('@app/config/config.service');
jest.mock('@app/logger/logger.service');
jest.mock('@app/ldap/ldap.service');
jest.mock('../../portal/src/user/user.service');

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      imports: [
        LoggerModule,
        ConfigModule.register(resolve(__dirname, '../../..', '.env')),

        LdapModule.registerAsync({
          useFactory: () => ({} as LdapModuleOptions),
        }),

        TypeOrmModule.forRoot({}),
        // TypeOrmModule.forFeature([UserEntity]),

        UserModule,
      ],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });
  });
});
