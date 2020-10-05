/** @format */

//#region Imports NPM
import { JoinColumn, ManyToOne } from 'typeorm';
//#endregion
//#region Imports Local
import { UserEntityMock } from '@back/user/user.entity.mock';
import { NewsEntity } from './news.entity';
//#endregion

export class NewsEntityMock extends NewsEntity {
  @ManyToOne(() => UserEntityMock)
  @JoinColumn()
  user!: UserEntityMock;
}
