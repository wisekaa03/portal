/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// #endregion
// #region Imports Local
import { MediaEntity } from './media.entity';
import { Media } from './models/media.dto';
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
  media = async (): Promise<MediaEntity[]> => {
    // TODO: сделать чтобы выводилось постранично
    return this.mediaRepository.find();
  };

  /**
   * Edit media
   *
   * @return id
   */
  editMedia = async ({ title, file, user, id }: Media): Promise<MediaEntity> => {
    const data = {
      title,
      file,
      user,
      id,
    };

    return this.mediaRepository.save(this.mediaRepository.create(data)).catch((error) => {
      throw error;
    });
  };

  /**
   * Delete news
   *
   * @return void
   */
  deleteMedia = async (id: string): Promise<boolean> => {
    const deleteResult = await this.mediaRepository.delete({ id });

    return !!(deleteResult.affected && deleteResult.affected > 0);
  };
}
