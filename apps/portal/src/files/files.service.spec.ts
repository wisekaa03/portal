/** @format */
/* eslint spaced-comment:0, max-classes-per-file:0 */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { LoggerModule } from 'nestjs-pino';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { UserService } from '@back/user/user.service';
import { ProfileService } from '@back/profile/profile.service';
import { FilesService } from './files.service';
//#endregion

jest.mock('nextcloud-link');
jest.mock('@app/config/config.service');

const serviceMock = jest.fn(() => ({}));

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        ConfigService,
        FilesService,
        { provide: UserService, useValue: serviceMock },
        { provide: ProfileService, useValue: serviceMock },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
