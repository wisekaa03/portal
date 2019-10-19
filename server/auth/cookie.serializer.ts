/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User, UserToSave } from '../user/models/user.dto';
// #endregion
// #region Imports Local
// #endregion

@Injectable()
export class CookieSerializer extends PassportSerializer {
  serializeUser(user: any, done: Function): void {
    const s: UserToSave = user;

    if (typeof s.profile === 'object' && s.profile.thumbnailPhoto) {
      s.profile.thumbnailPhoto = ((s.profile.thumbnailPhoto as unknown) as Buffer).toString('base64');
    }

    done(null, JSON.stringify(s));
  }

  deserializeUser(payload: any, done: Function): void {
    const s: User = JSON.parse(payload);

    if (s.profile && s.profile.thumbnailPhoto) {
      s.profile.thumbnailPhoto = Buffer.from((s.profile.thumbnailPhoto as unknown) as string, 'base64');
    }

    done(null, s);
  }
}
