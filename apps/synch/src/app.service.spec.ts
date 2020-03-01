/** @format */
/* eslint max-classes-per-file:0 */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
// #endregion
// #region Imports Local
// import { ConfigModule, ConfigService } from '@app/config';
import { LogService } from '@app/logger';
import { LdapService } from '@app/ldap';
import { SynchService } from './app.service';
import { GroupService } from '../../portal/src/group/group.service';
import { UserService } from '../../portal/src/user/user.service';
import { ProfileService } from '../../portal/src/profile/profile.service';
import { ImageService } from '../../../libs/image/src/image.service';
// #endregion

const serviceMock = jest.fn(() => ({}));

describe('Synch service', () => {
  let libs: SynchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        SynchService,
        { provide: I18nService, useValue: serviceMock },
        { provide: LogService, useValue: serviceMock },
        { provide: ImageService, useValue: serviceMock },
        { provide: LdapService, useValue: serviceMock },
        { provide: UserService, useValue: serviceMock },
        { provide: GroupService, useValue: serviceMock },
        { provide: ProfileService, useValue: serviceMock },
      ],
    }).compile();

    libs = module.get<SynchService>(SynchService);
  });

  it('should be defined', () => {
    expect(libs).toBeDefined();
  });
});
