/** @format */

// #region Imports NPM
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, HttpService } from '@nestjs/common';
import { Repository } from 'typeorm';
// import { Observable } from 'rxjs';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { ConfigService } from '@app/config';
import { News } from './models/news.dto';
import { NewsEntity } from './news.entity';
// #endregion

@Injectable()
export class NewsService {
  constructor(
    // @InjectRepository(NewsEntity)
    // private readonly newsRepository: Repository<NewsEntity>,
    private readonly httpService: HttpService,
    private readonly logService: LogService,
    private readonly configService: ConfigService,
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
  ) {}

  /**
   * Fetch news
   *
   * @return News
   */
  news = async (): Promise<any> => {
    const response = await this.httpService
      .get(this.configService.get<string>('NEWS_URL'), {
        params: { per_page: 20 },
      })
      .toPromise();

    return response && (response as any).data;
  };

  /**
   * Edit news
   *
   * @return id
   */
  editNews = async ({ title, excerpt, content, updatedAt, id }: News): Promise<string> => {
    return '';
  };

  /**
   * Delete news
   *
   * @return void
   */
  deleteNews = async ({ id }: { id: string }): Promise<boolean> => {
    return true;
  };
}
