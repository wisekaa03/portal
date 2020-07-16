/** @format */

import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { User, UserSettingsTaskFavorite, ColumnNames } from '@lib/types';
import { FONT_SIZE_NORMAL } from '../constants';
import { Group } from '../types/group.dto';

export const resolvers = {
  Query: {
    me: (
      _root: Record<string, unknown>,
      _arguments: Record<string, unknown>,
      { user }: { user?: User },
    ): User | null => {
      if (__SERVER__) {
        if (user) {
          delete user.password;

          const data = {
            ...user,
            groups: Array.isArray(user.groups)
              ? [
                  ...user.groups?.reduce((accumulator, element) => {
                    if (element.id && element.dn && element.loginService && element.name) {
                      return [
                        ...accumulator,
                        { ...element, description: element.description || '', __typename: 'Group' },
                      ];
                    }
                    return accumulator;
                  }, [] as Group[]),
                ]
              : [],
            profile: {
              ...user.profile,
              manager: user.profile?.manager
                ? {
                    ...user.profile.manager,
                    __typename: 'Profile',
                  }
                : null,
              __typename: 'Profile',
            },
            settings: {
              ...user.settings,
              fontSize: user.settings.fontSize || FONT_SIZE_NORMAL,
              lng: user.settings.lng || 'en',
              phonebook: user.settings.phonebook?.columns
                ? {
                    columns: user.settings.phonebook.columns,
                    __typename: 'UserSettingsPhonebook',
                  }
                : [],
              task: {
                status: user.settings.task?.status,
                favorites: user.settings.task?.favorites
                  ? [
                      ...user.settings.task?.favorites?.reduce((accumulator, element) => {
                        if (element.code && element.svcCode && element.where) {
                          return [...accumulator, { ...element, __typename: 'UserSettingsTaskFavorite' }];
                        }
                        return accumulator;
                      }, [] as UserSettingsTaskFavorite[]),
                    ]
                  : [],
                __typename: 'UserSettingsTask',
              },
              __typename: 'UserSettings',
            },
            __typename: 'User',
          } as User;

          return data;
        }
      }

      throw new UnauthorizedException();
    },
  },
};
