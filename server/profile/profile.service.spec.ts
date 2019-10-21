/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { ProfileService } from './profile.service';
import { ProfileEntity } from './profile.entity';
import { LogService } from '../logger/logger.service';
import { LogServiceMock } from '../../__mocks__/logger.service.mock';
import { LdapModule } from '../ldap/ldap.module';
import { LdapModuleOptions } from '../ldap/interfaces/ldap.interface';
import { LdapService } from '../ldap/ldap.service';
import { LdapServiceMock } from '../../__mocks__/ldap.service.mock';
import { UserEntity } from '../user/user.entity';
import { MockRepository } from '../../__mocks__/mockRepository.mock';
// #endregion

jest.mock('../logger/logger.service');
jest.mock('../ldap/ldap.service');

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({}),
        TypeOrmModule.forFeature([ProfileEntity]),
        LdapModule.registerAsync({
          useFactory: () => ({} as LdapModuleOptions),
        }),
      ],
      providers: [
        ProfileService,
        { provide: LogService, useClass: LogServiceMock },
        // { provide: LdapService, useValue: LdapServiceMock },
        { provide: getRepositoryToken(UserEntity), useValue: MockRepository },
        { provide: getRepositoryToken(ProfileEntity), useValue: MockRepository },
      ],
    })
      .overrideProvider(LdapService)
      .useValue(LdapServiceMock)
      .compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
