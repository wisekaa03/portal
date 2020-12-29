/** @format */

//#region Imports NPM
import type { Request, Response } from 'express';
import { Query, Mutation, Resolver, Args, Context, Int, ID } from '@nestjs/graphql';
import {
  Inject,
  UseGuards,
  NotAcceptableException,
  BadRequestException,
  ForbiddenException,
  PayloadTooLargeException,
  UnprocessableEntityException,
  UnauthorizedException,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { paginate, Order, Connection, OrderDirection } from 'typeorm-graphql-pagination';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import { PROFILE_TYPE } from '@lib/types/profile';
import { IsAdminGuard, GqlAuthGuard } from '@back/guards';
import { User, CurrentUser } from '@back/user';
import { UserSettingsPhonebookFilterInput } from '@back/user/graphql/UserSettingsPhonebookFilter.input';
import { ProfileInput, PaginatedProfile, ProfileOrderInput, SearchSuggestions, PhonebookColumnNames } from './graphql';
import { Profile } from './profile.entity';
import { ProfileService } from './profile.service';
//#endregion

@Resolver()
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService, @Inject(Logger) private readonly logger: LoggerService) {}

  /**
   * GraphQL query: profiles
   *
   * @param {number} first
   * @param {string} after
   * @param {Order<string>} orderBy
   * @param {string} search
   * @param {boolean} disabled
   * @returns {Promise<Connection<ProfilesEntity>>}
   */
  @Query(() => PaginatedProfile)
  @UseGuards(GqlAuthGuard)
  async profiles(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @Args('filters', { type: () => [UserSettingsPhonebookFilterInput], nullable: true }) filters: UserSettingsPhonebookFilterInput[] = [],
    @Args('first', { type: () => Int, nullable: true }) first = 50,
    @Args('after', { type: () => String, nullable: true }) after = '',
    @Args('orderBy', { type: () => ProfileOrderInput, nullable: true })
    orderBy: Order<string> = { direction: OrderDirection.ASC, field: 'lastName' },
    @Args('search', { type: () => String, nullable: true }) search = '',
    @Args('disabled', { type: () => Boolean, nullable: true }) disabled?: boolean,
    @Args('notShowing', { type: () => Boolean, nullable: true }) notShowing = false,
  ): Promise<Connection<PROFILE_TYPE>> {
    if (notShowing && !user.isAdmin) {
      notShowing = false;
    }

    return paginate(
      { first, after, orderBy },
      {
        type: 'Profile',
        alias: 'profile',
        validateCursor: false,
        orderFieldToKey: (field: string) => field,
        queryBuilder: this.profileService.getProfiles({
          search,
          disabled,
          notShowing,
          filters,
          loggerContext: { username: user.username, headers: request.headers },
        }),
      },
    );
  }

  /**
   * Profile field selection
   *
   * @async
   * @method profileFieldSelection
   * @param {string} field PhonebookFieldSelection
   * @returns {Promise<string[]>} Field selection
   */
  @Query(() => [String])
  @UseGuards(GqlAuthGuard)
  async profileFieldSelection(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @Args('field', { type: () => PhonebookColumnNames })
    field: PhonebookColumnNames,
  ): Promise<string[]> {
    return this.profileService.fieldSelection({
      field,
      loggerContext: { username: user.username, headers: request.headers },
    });
  }

  /**
   * Search suggestions
   *
   * @async
   * @method searchSuggestions
   * @param {string} search The search suggestions string
   * @returns {Promise<string[]>} The search suggestions
   */
  @Query(() => [SearchSuggestions])
  @UseGuards(GqlAuthGuard)
  async searchSuggestions(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @Args('search', { type: () => String }) search: string,
  ): Promise<SearchSuggestions[]> {
    return this.profileService.searchSuggestions({ search, loggerContext: { username: user.username, headers: request.headers } });
  }

  /**
   * Profile
   *
   * @async
   * @param {string} id optional id of profile
   * @returns {PROFILE_TYPE | undefined}
   */
  @Query(() => Profile)
  @UseGuards(GqlAuthGuard)
  async profile(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<PROFILE_TYPE | undefined> {
    return this.profileService.byId({ id, loggerContext: { username: user.username, headers: request.headers } }) || undefined;
  }

  /**
   * Change profile
   *
   * @async
   * @method changeProfile
   * @param {Request} req The request from which I try to compose user
   * @param {Profile} profile The profile
   * @param {Promise<FileUpload>} thumbnailPhoto Avatar
   * @returns {Promise<PROFILE_TYPE>}
   */
  @Mutation(() => Profile)
  @UseGuards(GqlAuthGuard)
  @UseGuards(IsAdminGuard)
  async changeProfile(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @Args('profile', { type: () => ProfileInput }) profile: ProfileInput,
    @Args('thumbnailPhoto', { type: () => GraphQLUpload, nullable: true }) thumbnailPhoto?: Promise<FileUpload>,
  ): Promise<PROFILE_TYPE> {
    return this.profileService
      .changeProfile({ user, profile, thumbnailPhoto, loggerContext: { username: user.username, headers: request.headers } })
      .then((userLogin) => {
        request.logIn(user, async (error: Error) => {
          if (error) {
            this.logger.error({
              message: `Error when changing profile: ${error.toString()}`,
              error,
              context: ProfileResolver.name,
              username: user?.username,
              headers: request.headers,
            });

            throw new NotAcceptableException(__DEV__ ? error : undefined);
          }
        });

        return userLogin;
      });
  }
}
