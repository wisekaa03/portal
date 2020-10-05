/** @format */

//#region Imports NPM
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
//#endregion
//#region Imports Local
import { News } from '@lib/types';
// import { ConfigService } from '@app/config';
import { UserService } from '@back/user/user.service';
import { NewsEntity } from './news.entity';
//#endregion

@Injectable()
export class NewsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    // private readonly configService: ConfigService,
    private readonly userService: UserService,
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
  ) {}

  /**
   * Fetch news
   *
   * @return News
   */
  news = async (): Promise<NewsEntity[]> =>
    // TODO: сделать чтобы выводилось постранично
    this.newsRepository.find();

  /**
   * Edit news
   *
   * @return id
   */
  editNews = async ({ title, excerpt, content, author, id }: NewsEntity): Promise<NewsEntity> => {
    const data = this.newsRepository.create({
      title,
      excerpt,
      content,
      author,
      id,
    });

    return this.newsRepository.save(data).catch((error) => {
      throw error;
    });
  };

  /**
   * Delete news
   *
   * @return void
   */
  deleteNews = async (id: string): Promise<boolean> => {
    const deleteResult = await this.newsRepository.delete({ id });

    return !!(deleteResult.affected && deleteResult.affected > 0);
  };
}
