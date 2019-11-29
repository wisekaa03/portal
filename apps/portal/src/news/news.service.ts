/** @format */

// #region Imports NPM
import { Injectable, HttpService } from '@nestjs/common';
// import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
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
  news = async (): Promise<AxiosResponse<any>> =>
    this.httpService.get(this.configService.get<string>('NEWS_URL')).toPromise();
}
