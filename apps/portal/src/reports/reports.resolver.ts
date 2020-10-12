/** @format */

//#region Imports NPM
import type { Request } from 'express';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { Query, Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { FileUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config';
import { ReportsInput } from '@lib/types/reports';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { CurrentUser, PasswordFrontend } from '@back/user/user.decorator';
import { ReportsService } from './reports.service';
//#endregion

@Resolver('ReportsResolver')
export class ReportsResolver {
  constructor(private readonly configService: ConfigService, private readonly reportsService: ReportsService) {}

  /**
   * Reports
   *
   * @async
   * @returns {Boolean}
   * @throws {UnauthorizedException | HttpException}
   */
  @Mutation('reports')
  @UseGuards(GqlAuthGuard)
  async reports(
    @Context('req') request: Request,
    @Args('report') report: ReportsInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<boolean> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
