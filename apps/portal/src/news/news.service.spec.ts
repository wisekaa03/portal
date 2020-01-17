/** @format */
/* eslint spaced-comment:0, prettier/prettier:0, max-classes-per-file:0 */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// #endregion
// #region Imports Local
import { ConfigModule } from '@app/config';
import { LoggerModule } from '@app/logger';
import { NewsService } from './news.service';
import { UserModule } from '../user/user.module';
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
class NewsEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;
}

jest.mock('../user/user.service');
jest.mock('../profile/profile.service');
jest.mock('@app/ldap/ldap.service');
jest.mock('../guards/gqlauth.guard');
jest.mock('@app/config/config.service');

describe('NewsService', () => {
  let service: NewsService;

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
              entities: [UserEntity, GroupEntity, ProfileEntity, NewsEntity],
              synchronize: true,
              logging: false,
            } as TypeOrmModuleOptions),
        }),
        TypeOrmModule.forFeature([NewsEntity]),
      ],
      providers: [NewsService],
    }).compile();

    service = module.get<NewsService>(NewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
