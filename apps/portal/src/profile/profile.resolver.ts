/** @format */

//#region Imports NPM
import { Query, Mutation, Resolver, Args, Context, ResolveProperty } from '@nestjs/graphql';
import {
  UseGuards,
  NotAcceptableException,
  BadRequestException,
  ForbiddenException,
  PayloadTooLargeException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { paginate, Order, Connection } from 'typeorm-graphql-pagination';
import { Request } from 'express';
import { FileUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import type { ProfileInput, SearchSuggestions, User } from '@lib/types';
import { PROFILE_AUTOCOMPLETE_FIELDS } from '@lib/constants';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { IsAdminGuard } from '@back/guards/gqlauth-admin.guard';
import { CurrentUser } from '@back/user/user.decorator';
import { ProfileService } from './profile.service';
import { ProfileEntity } from './profile.entity';
//#endregion

@Resolver('Profile')
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

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
  @Query()
  @UseGuards(GqlAuthGuard)
  async profiles(
    @Args('first') first: number,
    @Args('after') after: string,
    @Args('orderBy') orderBy: Order<string>,
    @Args('search') search: string,
    @Args('disabled') disabled: boolean,
    @Args('notShowing') notShowing: boolean,
    @CurrentUser() user?: User,
  ): Promise<Connection<ProfileEntity>> {
    if (notShowing && !user?.isAdmin) {
      notShowing = false;
    }

    return paginate(
      { first, after, orderBy },
      {
        type: 'Profile',
        alias: 'profile',
        validateCursor: false,
        orderFieldToKey: (field: string) => field,
        queryBuilder: this.profileService.getProfiles(search, disabled, notShowing),
      },
    );
  }

  /**
   * Profile field selection
   *
   * @async
   * @method profileFieldSelection
   * @param {string} field Field: 'company' | 'management' | 'department' | 'division' | 'country' |
   *                              'region' | 'town' | 'street' | 'postalCode'
   * @returns {Promise<string[]>} Field selection
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async profileFieldSelection(
    @Args('field')
    field: typeof PROFILE_AUTOCOMPLETE_FIELDS[number],
    @Args('department') department: string,
  ): Promise<string[]> {
    if (PROFILE_AUTOCOMPLETE_FIELDS.includes(field)) {
      return this.profileService.fieldSelection(field, department);
    }

    throw new NotAcceptableException();
  }

  /**
   * Search suggestions
   *
   * @async
   * @method searchSuggestions
   * @param {string} search The search suggestions string
   * @returns {Promise<string[]>} The search suggestions
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async searchSuggestions(@Args('search') search: string): Promise<SearchSuggestions[]> {
    return this.profileService.searchSuggestions(search);
  }

  /**
   * Profile
   *
   * @async
   * @param {string} id optional id of profile
   * @returns {ProfilesEntity | undefined}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async profile(@Args('id') id: string): Promise<ProfileEntity | undefined> {
    return this.profileService.byId(id) || undefined;
  }

  /**
   * Change profile
   *
   * @async
   * @method changeProfile
   * @param {Request} req The request from which I try to compose user
   * @param {Profile} profile The profile
   * @param {Promise<FileUpload>} thumbnailPhoto Avatar
   * @returns {Promise<ProfileEntity>}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  @UseGuards(IsAdminGuard)
  async changeProfile(
    @Context('req') request: Request,
    @Args('profile') profile: ProfileInput,
    @Args('thumbnailPhoto') thumbnailPhoto?: Promise<FileUpload>,
  ): Promise<ProfileEntity> {
    return this.profileService
      .changeProfile(request, profile, thumbnailPhoto)
      .catch(
        async (
          error:
            | Error
            | BadRequestException
            | NotAcceptableException
            | ForbiddenException
            | PayloadTooLargeException
            | UnprocessableEntityException,
        ) => {
          throw error;
        },
      );
  }
}
