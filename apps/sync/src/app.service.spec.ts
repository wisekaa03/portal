/** @format */
/* eslint max-classes-per-file:0 */

//#region Imports NPM
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LdapService } from 'nestjs-ldap';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { ImageService } from '@app/image/image.service';
import { GroupService } from '@back/group/group.service';
import { UserService } from '@back/user/user.service';
import { ProfileService } from '@back/profile/profile.service';
import { SyncService } from './app.service';
//#endregion

jest.mock('@app/config/config.service');

const serviceMock = jest.fn(() => ({}));

describe(SyncService.name, () => {
  let libs: SyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        ConfigService,
        SyncService,
        { provide: Logger, useValue: serviceMock },
        { provide: ImageService, useValue: serviceMock },
        { provide: LdapService, useValue: serviceMock },
        { provide: UserService, useValue: serviceMock },
        { provide: GroupService, useValue: serviceMock },
        { provide: ProfileService, useValue: serviceMock },
      ],
    }).compile();

    libs = module.get<SyncService>(SyncService);
  });

  it('should be defined', () => {
    expect(libs).toBeDefined();
  });
});
