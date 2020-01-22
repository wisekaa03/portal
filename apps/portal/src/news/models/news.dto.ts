/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { UserEntity } from '../../user/user.entity';
// #endregion

// #region Profile
export interface News {
  id?: string;

  createdAt?: Date;

  updatedAt?: Date;

  title: string;

  excerpt: string;

  content: string;

  user?: UserEntity;
}
// #endregion