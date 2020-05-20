/** @format */

//#region Imports NPM
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
//#endregion
//#region Imports Local
//#endregion

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<Express.Request>();

    if (!!request?.session?.passport?.user) {
      return true;
    }

    throw new UnauthorizedException('Session guard');
  }
}
