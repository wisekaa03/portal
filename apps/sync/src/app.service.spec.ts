/** @format */
/* eslint max-classes-per-file:0 */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { LdapService } from '@app/ldap';
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
      imports: [LoggerModule.forRoot()],
      providers: [
        ConfigService,
        SyncService,
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
