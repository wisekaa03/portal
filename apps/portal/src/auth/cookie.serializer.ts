/** @format */

//#region Imports NPM
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
//#endregion
//#region Imports Local
//#endregion

@Injectable()
export class CookieSerializer extends PassportSerializer {
  serializeUser(user: any, done: Function): void {
    done(null, user);
  }

  deserializeUser(payload: any, done: Function): void {
    done(null, payload);
  }
}
