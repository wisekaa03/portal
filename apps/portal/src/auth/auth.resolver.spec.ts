/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { ConfigModule } from '@app/config';
import { LdapModule, LdapModuleOptions } from '@app/ldap';
import { AuthResolver } from './auth.resolver';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
// #endregion

jest.mock('@app/ldap/ldap.service');
jest.mock('../shared/session-redis');
jest.mock('./auth.service');
jest.mock('../user/user.service');
jest.mock('../guards/gqlauth.guard');

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.register(resolve(__dirname, '../../../..', '.env')),

        TypeOrmModule.forRoot({}),

        LdapModule.registerAsync({
          useFactory: () => ({} as LdapModuleOptions),
        }),

        UserModule,
      ],
      providers: [AuthResolver, AuthService],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
