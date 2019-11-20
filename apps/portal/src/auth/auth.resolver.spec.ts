/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { AuthResolver } from './auth.resolver';
import { UserModule } from '../user/user.module';
import { LdapModule } from '../ldap/ldap.module';
import { LdapModuleOptions } from '../ldap/ldap.interface';
import { AuthService } from './auth.service';
import { ConfigModule } from '../config/config.module';
// #endregion

jest.mock('../shared/session-redis.ts');
jest.mock('../ldap/ldap.service.ts');
jest.mock('./auth.service.ts');
jest.mock('../user/user.service.ts');
jest.mock('../guards/gqlauth.guard.ts');

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
