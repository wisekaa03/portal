/** @format */

// #region Imports NPM
import { Injectable, HttpService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { ImageService } from '@app/image';
import { LdapService } from '@app/ldap';
// #endregion

@Injectable()
export class NewsService {
  constructor(
    // @InjectRepository(NewsEntity)
    // private readonly newsRepository: Repository<NewsEntity>,
    private readonly httpService: HttpService,
    private readonly logService: LogService,
  ) {}

  /**
   * News
   *
   * @return News
   */
  news = async (): Promise<AxiosResponse<any>> =>
    this.httpService.get('https://i-npz.ru/wp/index.php/wp-json/wp/v2/posts').toPromise();
  // this.profileRepository.findOne(id, { relations: ['manager'], cache: true });
}
