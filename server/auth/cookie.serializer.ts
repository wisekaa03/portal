/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from '../user/models/user.dto';
// #endregion
// #region Imports Local
// #endregion

@Injectable()
export class CookieSerializer extends PassportSerializer {
  serializeUser(user: User, done: Function): any {
    const s: any = user;

    if (s.profile && s.profile.thumbnailPhoto) {
      s.profile.thumbnailPhoto = s.profile.thumbnailPhoto.toString('base64');
    }

    done(null, s);
  }

  deserializeUser(payload: any, done: Function): any {
    const s = payload;

    if (s.profile && s.profile.thumbnailPhoto) {
      s.profile.thumbnailPhoto = Buffer.from(s.profile.thumbnailPhoto, 'base64');
    }

    done(null, s);
  }
}
