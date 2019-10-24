/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { LdapModule } from '../ldap/ldap.module';
import { LdapService } from '../ldap/ldap.service';
import { LdapServiceMock } from '../../__mocks__/ldap.service.mock';
import { LdapModuleOptions } from '../ldap/interfaces/ldap.interface';
import { ProfileModule } from '../profile/profile.module';
import { UserEntity } from './user.entity';
import { UserResolver } from './user.resolver';
import { ProfileEntity } from '../profile/profile.entity';
import { MockRepository } from '../../__mocks__/mockRepository.mock';
import { UserService } from './user.service';
// #endregion

jest.mock('../guards/gqlauth.guard');
jest.mock('../ldap/ldap.service');
jest.mock('./user.service');

describe('UsersResolver', () => {
  let resolver: UserResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LdapModule.registerAsync({
          useFactory: () => {
            return {} as LdapModuleOptions;
          },
        }),

        // #region TypeORM
        TypeOrmModule.forRoot({}),
        TypeOrmModule.forFeature([UserEntity]),
        // #endregion

        ProfileModule,
      ],
      providers: [
        UserService,
        UserResolver,
        { provide: LdapService, useValue: LdapServiceMock },
        { provide: getRepositoryToken(UserEntity), useValue: MockRepository },
        { provide: getRepositoryToken(ProfileEntity), useValue: MockRepository },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
