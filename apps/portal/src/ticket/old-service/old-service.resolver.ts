/** @format */

// #region Imports NPM
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { Query, Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { Request } from 'express';
import { FileUpload } from 'graphql-upload';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { SoapAuthentication } from '@app/soap';
import { OldService, OldTicket, OldTicketNewInput, OldTicketNew, OldTicketEditInput } from '@lib/types';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { CurrentUser, PasswordFrontend } from '@back/user/user.decorator';
import { User } from '@lib/types/user.dto';
import { OldTicketService } from './old-service.service';
// #endregion

@Resolver('OldTicketResolver')
export class OldTicketResolver {
  constructor(private readonly configService: ConfigService, private readonly ticketOldService: OldTicketService) {}

  /**
   * (Old) Get service
   *
   * @async
   * @returns {OldService[]}
   * @throws {UnauthorizedException}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async OldTicketService(@CurrentUser() user: User, @PasswordFrontend() password: string): Promise<OldService[]> {
    const authentication = {
      username: user.username,
      password,
      domain: this.configService.get<string>('SOAP_DOMAIN'),
    } as SoapAuthentication;

    return this.ticketOldService.OldTicketService(authentication).catch((error: Error) => {
      throw new UnauthorizedException(error.message);
    });
  }

  /**
   * (Old) Ticket new
   *
   * @async
   * @method OldTicketNew
   * @param {OldTicketNewInput} ticket subject, body, serviceID and others
   * @param {Promise<FileUpload>[]} attachments Array of attchments
   * @returns {OldTicketNew}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async OldTicketNew(
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('ticket') ticket: OldTicketNewInput,
    @Args('attachments') attachments: Promise<FileUpload>[],
  ): Promise<OldTicketNew> {
    const authentication = {
      username: user.username,
      password,
      domain: this.configService.get<string>('SOAP_DOMAIN'),
    } as SoapAuthentication;

    return this.ticketOldService.OldTicketNew(authentication, ticket, attachments).catch((error: Error) => {
      throw new UnauthorizedException(error.message);
    });
  }

  /**
   * GraphQL mutation: TicketEdit
   *
   * @returns {OldTicket}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async OldTicketEdit(
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('ticket') ticket: OldTicketEditInput,
    @Args('attachments') attachments: Promise<FileUpload>[],
  ): Promise<OldTicket> {
    if (user) {
      const authentication = {
        username: user.username,
        password,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      } as SoapAuthentication;

      return this.ticketOldService.OldTicketEdit(authentication, ticket, attachments).catch((error: Error) => {
        throw new UnauthorizedException(error.message);
      });
    }

    throw new UnauthorizedException();
  }

  /**
   * GraphQL query: GetTickets
   *
   * @returns {OldTicket[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async OldTickets(
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('status') status: string,
  ): Promise<OldService[]> {
    if (user) {
      const authentication = {
        username: user.username,
        password,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      } as SoapAuthentication;

      return this.ticketOldService.OldTickets(authentication, status).catch((error: Error) => {
        throw new UnauthorizedException(error.message);
      });
    }

    throw new UnauthorizedException();
  }

  /**
   * GraphQL query: GetTicketDescription
   *
   * @returns {OldTicket}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async OldTicketDescription(
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('code') code: string,
    @Args('type') type: string,
  ): Promise<OldService> {
    if (user) {
      const authentication = {
        username: user.username,
        password,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      } as SoapAuthentication;

      return this.ticketOldService.OldTicketDescription(authentication, code, type).catch((error: Error) => {
        throw new UnauthorizedException(error.message);
      });
    }

    throw new UnauthorizedException();
  }
}
