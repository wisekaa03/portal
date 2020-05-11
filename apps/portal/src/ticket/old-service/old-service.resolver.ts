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
  OldTicket,
  OldTicketNewInput,
  OldTicketNew,
  OldTicketEditInput,
  OldServices,
  OldTickets,
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
  @Query()
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
  @Query()
  @UseGuards(GqlAuthGuard)
  async OldTickets(
    @Args('status') status: string,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<OldTickets[]> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    const authentication = {
      username: user?.username,
      password,
      domain: this.configService.get<string>('SOAP_DOMAIN'),
    } as SoapAuthentication;

    return this.ticketOldService.OldTickets(authentication, user, status).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  /**
   * Ticket new
   *
   * @async
   * @method OldTicketNew
   * @param {OldTicketNewInput} ticket subject, body, serviceID and others
   * @param {Promise<FileUpload>[]} attachments Array of attachments
   * @returns {OldTicketNew}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async OldTicketNew(
    @Args('ticket') ticket: OldTicketNewInput,
    @Args('attachments') attachments: Promise<FileUpload>[],
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<OldTicketNew> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    const authentication = {
      username: user?.username,
      password,
      domain: this.configService.get<string>('SOAP_DOMAIN'),
    } as SoapAuthentication;

    return this.ticketOldService.OldTicketNew(authentication, ticket, attachments).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  /**
   * Ticket edit
   *
   * @async
   * @returns {OldTicket}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async OldTicketEdit(
    @Args('ticket') ticket: OldTicketEditInput,
    @Args('attachments') attachments: Promise<FileUpload>[],
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<OldTicket> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    const authentication = {
      username: user?.username,
      password,
      domain: this.configService.get<string>('SOAP_DOMAIN'),
    } as SoapAuthentication;

    return this.ticketOldService.OldTicketEdit(authentication, ticket, attachments).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  /**
   * Ticket description
   *
   * @async
   * @returns {OldTicket}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async OldTicketDescription(
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

    return this.ticketOldService.OldTicketDescription(authentication, code, type).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }
}
