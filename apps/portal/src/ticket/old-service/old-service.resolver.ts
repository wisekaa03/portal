/** @format */

// #region Imports NPM
import { UseGuards, UnauthorizedException, HttpException } from '@nestjs/common';
import { Query, Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { Request } from 'express';
import { FileUpload } from 'graphql-upload';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { SoapAuthentication } from '@app/soap';
import {
  OldService,
  OldTask,
  OldTicketTaskNewInput,
  OldTicketTaskNew,
  OldTicketTaskEditInput,
  OldServices,
  OldTasks,
} from '@lib/types';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { CurrentUser, PasswordFrontend } from '@back/user/user.decorator';
import { User } from '@lib/types/user.dto';
import { OldTicketService } from './old-service.service';
// #endregion

@Resolver('OldTicketResolver')
export class OldTicketResolver {
  constructor(private readonly configService: ConfigService, private readonly ticketOldService: OldTicketService) {}

  /**
   * Get service
   *
   * @async
   * @returns {OldServices[]}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('OldTicketService')
  @UseGuards(GqlAuthGuard)
  async OldTicketService(
    @Args('find') find?: string,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<OldServices[]> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    const authentication = {
      username: user?.username,
      password,
      domain: this.configService.get<string>('SOAP_DOMAIN'),
    } as SoapAuthentication;

    return this.ticketOldService.OldTicketService(authentication, user, find || '').catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  /**
   * Tickets list
   *
   * @async
   * @param {string} status Status
   * @returns {OldTicket[]}
   */
  @Query('OldTicketTasks')
  @UseGuards(GqlAuthGuard)
  async OldTicketTasks(
    @Args('status') status: string,
    @Args('find') find: string,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<OldTasks[]> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    const authentication = {
      username: user?.username,
      password,
      domain: this.configService.get<string>('SOAP_DOMAIN'),
    } as SoapAuthentication;

    const promise = await this.ticketOldService.OldTasks(authentication, user, status, find).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });

    return promise;
  }

  /**
   * Ticket new
   *
   * @async
   * @method OldTicketTaskNew
   * @param {OldTicketTaskNewInput} ticket subject, body, serviceID and others
   * @param {Promise<FileUpload>[]} attachments Array of attachments
   * @returns {OldTicketNew}
   */
  @Mutation('OldTicketTaskNew')
  @UseGuards(GqlAuthGuard)
  async OldTicketTaskNew(
    @Args('ticket') ticket: OldTicketTaskNewInput,
    @Args('attachments') attachments: Promise<FileUpload>[],
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<OldTicketTaskNew> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    const authentication = {
      username: user?.username,
      password,
      domain: this.configService.get<string>('SOAP_DOMAIN'),
    } as SoapAuthentication;

    return this.ticketOldService.OldTicketTaskNew(authentication, user, ticket, attachments).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  /**
   * Ticket edit
   *
   * @async
   * @returns {OldTicket}
   */
  @Mutation('OldTicketTaskEdit')
  @UseGuards(GqlAuthGuard)
  async OldTicketTaskEdit(
    @Args('ticket') ticket: OldTicketTaskEditInput,
    @Args('attachments') attachments: Promise<FileUpload>[],
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<OldTask> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    const authentication = {
      username: user?.username,
      password,
      domain: this.configService.get<string>('SOAP_DOMAIN'),
    } as SoapAuthentication;

    return this.ticketOldService.OldTicketTaskEdit(authentication, user, ticket, attachments).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  /**
   * Ticket description
   *
   * @async
   * @returns {OldTicket}
   */
  @Query('OldTicketTaskDescription')
  @UseGuards(GqlAuthGuard)
  async OldTicketTaskDescription(
    @Args('code') code: string,
    @Args('type') type: string,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<OldService> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    const authentication = {
      username: user?.username,
      password,
      domain: this.configService.get<string>('SOAP_DOMAIN'),
    } as SoapAuthentication;

    return this.ticketOldService.OldTicketTaskDescription(authentication, user, code, type).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }
}
