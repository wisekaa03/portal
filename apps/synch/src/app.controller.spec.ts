/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from '../../portal/src/logger/logger.module';
// import { LogService } from '../../portal/src/logger/logger.service';
import { LdapModule } from '../../portal/src/ldap/ldap.module';
import { LdapModuleOptions } from '../../portal/src/ldap/interfaces/ldap.interface';
import { UserModule } from '../../portal/src/user/user.module';
import { UserEntity } from '../../portal/src/user/user.entity';
// #endregion

jest.mock('../../portal/src/user/user.service');
jest.mock('../../portal/src/logger/logger.service');
jest.mock('../../portal/src/ldap/ldap.service');

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      imports: [
        LoggerModule,

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
