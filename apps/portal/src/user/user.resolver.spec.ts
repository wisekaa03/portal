/** @format */

// #region Imports NPM
// import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
// import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
// import { ConfigModule } from '@app/config';
// import { LdapModule, LdapService, LdapModuleOptions } from '@app/ldap';
// import { ProfileModule } from '../profile/profile.module';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
// #endregion

// jest.mock('@nestjs/typeorm/dist/typeorm.module');
// jest.mock('@app/ldap/ldap.service');
// jest.mock('@app/config/config.service');
// jest.mock('./user.entity');
// jest.mock('../profile/profile.module');
// jest.mock('../profile/profile.service');
jest.mock('./user.service');

describe('UsersResolver', () => {
  let resolver: UserResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // ConfigModule.register('.env'),
        // LdapModule.registerAsync({
        //   useFactory: () => {
        //     return {} as LdapModuleOptions;
        //   },
        // }),
        // #region TypeORM
        // TypeOrmModule.forRoot({}),
        // #endregion
        // ProfileModule,
      ],
      providers: [UserService, UserResolver],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
