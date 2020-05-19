/** @format */
/* eslint spaced-comment:0, max-classes-per-file:0 */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
//#endregion
//#region Imports Local
import { ImageService } from '@app/image';
import { NewsResolver } from './news.resolver';
import { NewsService } from './news.service';
import { UserService } from '../user/user.service';
//#endregion

const serviceMock = jest.fn(() => ({}));

@Entity()
class NewsEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;
}

// jest.mock('../guards/gqlauth.guard');

describe('NewsResolver', () => {
  let resolver: NewsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: async () =>
            ({
              type: 'sqlite',
              database: ':memory:',
              dropSchema: true,
              entities: [NewsEntity],
              synchronize: true,
              logging: false,
            } as TypeOrmModuleOptions),
        }),
        TypeOrmModule.forFeature([NewsEntity]),
      ],
      providers: [
        NewsResolver,
        { provide: NewsService, useValue: serviceMock },
        { provide: ImageService, useValue: serviceMock },
        { provide: UserService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<NewsResolver>(NewsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
