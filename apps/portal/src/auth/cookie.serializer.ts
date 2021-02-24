/** @format */
/* eslint @typescript-eslint/ban-types:0 */

//#region Imports NPM
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
//#endregion
//#region Imports Local
import type { User } from '@back/user';
//#endregion

@Injectable()
export class CookieSerializer extends PassportSerializer {
  serializeUser(user: User | null, done: Function): void {
    done(null, user);
  }

  deserializeUser(payload: Record<string, unknown>, done: Function): void {
    done(null, payload);
  }
}
