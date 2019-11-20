/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { LdapModule } from '../ldap/ldap.module';
import { LdapService } from '../ldap/ldap.service';
import { LdapModuleOptions } from '../ldap/ldap.interface';
import { ProfileModule } from '../profile/profile.module';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { ConfigModule } from '../config/config.module';
// #endregion

jest.mock('./user.entity');
jest.mock('../profile/profile.module');
jest.mock('../ldap/ldap.service');
jest.mock('./user.service');

describe('UsersResolver', () => {
  let resolver: UserResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.register(resolve(__dirname, '../../../..', '.env')),

        LdapModule.registerAsync({
          useFactory: () => {
            return {} as LdapModuleOptions;
          },
        }),

        // #region TypeORM
        TypeOrmModule.forRoot({}),
        // #endregion

        ProfileModule,
      ],
      providers: [UserService, UserResolver, LdapService],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
