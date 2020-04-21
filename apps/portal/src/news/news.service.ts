/** @format */

// #region Imports NPM
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
// import { Observable } from 'rxjs';
// #endregion
// #region Imports Local
import { News } from '@lib/types';
import { LogService } from '@app/logger';
// import { ConfigService } from '@app/config';
// import { UserService } from '../user/user.service';
import { NewsEntity } from './news.entity';
// #endregion

@Injectable()
export class NewsService {
  constructor(
    private readonly logger: LogService,
    // private readonly configService: ConfigService,
    // private readonly userService: UserService,
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
  ) {
    logger.setContext(NewsService.name);
  }

  /**
   * Fetch news
   *
   * @return News
   */
  news = async (): Promise<NewsEntity[]> => {
    // TODO: сделать чтобы выводилось постранично
    return this.newsRepository.find();
  };

  /**
   * Edit news
   *
   * @return id
   */
  editNews = async ({ title, excerpt, content, user, id }: News): Promise<NewsEntity> => {
    const data = {
      title,
      excerpt,
      content,
      user,
      id,
    };

    return this.newsRepository.save(this.newsRepository.create(data)).catch((error) => {
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
