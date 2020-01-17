/** @format */
/* eslint spaced-comment:0, prettier/prettier:0, max-classes-per-file:0 */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { LoggerModule } from '@app/logger';
import { ConfigModule } from '@app/config';
import { MediaResolver } from './media.resolver';
import { UserModule } from '../user/user.module';
import { MediaService } from './media.service';
// #endregion

@Entity()
class UserEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;
}

@Entity()
class GroupEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;
}

@Entity()
class ProfileEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;
}

@Entity()
class MediaEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;
}

jest.mock('./media.service');
jest.mock('../user/user.service');
jest.mock('../profile/profile.service');

describe('MediaResolver', () => {
  let resolver: MediaResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        ConfigModule.register('.env'),
        UserModule,
        TypeOrmModule.forRootAsync({
          useFactory: async () =>
            ({
              type: 'sqlite',
              database: ':memory:',
              dropSchema: true,
              entities: [UserEntity, GroupEntity, ProfileEntity, MediaEntity],
              synchronize: true,
              logging: false,
            } as TypeOrmModuleOptions),
        }),
        TypeOrmModule.forFeature([MediaEntity]),
      ],
      providers: [
        MediaService,
        MediaResolver],
    }).compile();

    resolver = module.get<MediaResolver>(MediaResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
