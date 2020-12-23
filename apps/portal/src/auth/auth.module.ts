/** @format */

//#region Imports NPM
import { Module, HttpModule, Logger } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
//#endregion
//#region Imports Local
import { UserModule } from '@back/user/user.module';
import { SubscriptionsModule } from '@back/subscriptions/subscriptions.module';
// import { ConfigService, ConfigModule } from '@app/config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { CookieSerializer } from './cookie.serializer';
import { LocalStrategy } from './strategies/local.strategy';
//#endregion

@Module({
  imports: [
    HttpModule,

    //#region Users module
    UserModule,
    //#endregion

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

    SubscriptionsModule,
  ],
  providers: [Logger, AuthService, AuthResolver, LocalStrategy, CookieSerializer] /* , JwtStrategy */,
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
