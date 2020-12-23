/** @format */

//#region Imports NPM
import type { Request } from 'express';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { Query, Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { FileUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import { User } from '@back/user/user.entity';
import { ConfigService } from '@app/config';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { CurrentUser, PasswordFrontend } from '@back/user/user.decorator';
import { ReportsService } from './reports.service';
import { ReportsInput } from './graphql';
//#endregion

@Resolver()
export class ReportsResolver {
  constructor(private readonly configService: ConfigService, private readonly reportsService: ReportsService) {}

  // /**
  //  * Reports
  //  *
  //  * @async
  //  * @returns {Boolean}
  //  * @throws {UnauthorizedException | HttpException}
  //  */
  // @Mutation(() => Boolean)
  // @UseGuards(GqlAuthGuard)
  // async reports(
  //   @Context('req') request: Request,
  //   @Args('report', { type: () => ReportsInput }) report: ReportsInput,
  //   @CurrentUser() user?: User,
  //   @PasswordFrontend() password?: string,
  // ): Promise<boolean> {
  //   if (!user || !password) {
  //     throw new UnauthorizedException();
  //   }

  //   return true;
  // }
}
