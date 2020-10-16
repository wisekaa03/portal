/** @format */

//#region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
//#endregion
//#region Imports Local
import { UserModule } from '@back/user/user.module';
import { SubscriptionsModule } from '@back/subscriptions/subscriptions.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { CookieSerializer } from './cookie.serializer';
import { LocalStrategy } from './strategies/local.strategy';
//#endregion

@Module({
  imports: [
    //#region Passport module
    PassportModule.register({ session: true, defaultStrategy: 'local' }),
    // JwtModule.registerAsync({
    //   useFactory: async () => {
    //     return {
    //       secret: ConfigService.jwtConstants.secret,
    //       signOptions: { expiresIn: '60s' },
    //     };
    //   },
    // }),
    //#endregion

    HttpModule,

    //#region Users module
    UserModule,
    //#endregion

    SubscriptionsModule,
  ],
  providers: [AuthService, AuthResolver, LocalStrategy, CookieSerializer] /* , JwtStrategy */,
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
