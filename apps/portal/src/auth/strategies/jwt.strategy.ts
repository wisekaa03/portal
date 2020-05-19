/** @format */

//#region Imports NPM
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config/config.service';
//#endregion

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: ConfigService.jwtConstants.secret,
    });
  }

  async validate(payload: any): Promise<Record<string, any>> {
    // eslint-disable-next-line no-debugger
    debugger;

    return { userId: payload.sub, username: payload.username };
  }
}
