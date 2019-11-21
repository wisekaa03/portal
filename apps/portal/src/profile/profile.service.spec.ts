/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { LdapModule, LdapModuleOptions } from '@app/ldap';
import { ImageModule } from '@app/image';
import { ProfileService } from './profile.service';
import { ProfileEntity } from './profile.entity';
// #endregion

jest.mock('@app/ldap');

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ImageModule,
        TypeOrmModule.forRoot({}),
        TypeOrmModule.forFeature([ProfileEntity]),
        LdapModule.registerAsync({
          useFactory: () => ({} as LdapModuleOptions),
        }),
      ],
      providers: [
        ProfileService,
        // { provide: LdapService, useValue: LdapServiceMock },
        // { provide: getRepositoryToken(UserEntity), useValue: MockRepository },
        // { provide: getRepositoryToken(ProfileEntity), useValue: MockRepository },
      ],
    })
      // .overrideProvider(LdapService)
      // .useValue(LdapServiceMock)
      .compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
