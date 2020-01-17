/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// #endregion
// #region Imports Local
import { MediaEntity } from './media.entity';
// #endregion

@Injectable()
export class MediaService {
  constructor(
    // private readonly logService: LogService,
    // private readonly configService: ConfigService,
    // private readonly userService: UserService,
    @InjectRepository(MediaEntity)
    private readonly mediaRepository: Repository<MediaEntity>,
  ) {}

  /**
   * Fetch news
   *
   * @return News
   */
  mediaGet = async (): Promise<MediaEntity[]> => {
    // TODO: сделать чтобы выводилось постранично
    return this.mediaRepository.find();
  };
}
