/** @format */

// #region Imports NPM
import { Injectable, HttpService } from '@nestjs/common';
// import { Observable } from 'rxjs';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { ConfigService } from '@app/config';
// #endregion

@Injectable()
export class NewsService {
  constructor(
    // @InjectRepository(NewsEntity)
    // private readonly newsRepository: Repository<NewsEntity>,
    private readonly httpService: HttpService,
    private readonly logService: LogService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * News
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
}
