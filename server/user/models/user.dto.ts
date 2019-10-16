/** @format */
/* eslint max-classes-per-file:0 */

// #region Imports NPM
import { IsNotEmpty } from 'class-validator';
// #endregion
// #region Imports Local
import { ProfileDTO } from '../../profile/models/profile.dto';
// #endregion

// #region User
export class UserDTO {
  id?: string;

  username: string;

  password?: string;

  email: string;

  isAdmin: boolean;

  profile?: ProfileDTO;

  createdAt?: Date;

  updatedAt?: Date;
}
// #endregion

// #region User response
export class UserResponseDTO extends UserDTO {
  token: string;
}
// #endregion

// #region User login
export class UserLoginDTO {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}
// #endregion

// #region User register
export class UserRegisterDTO {
  username: string;

  email: string;

  password: string;

  isAdmin: boolean;
}
// #endregion
