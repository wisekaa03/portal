/** @format */

import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { User, UserSettingsTaskFavorite, PhonebookColumnNames } from '@lib/types';
import { FONT_SIZE_NORMAL } from '../constants';
import { Group } from '../types/group.dto';

export const resolvers = {
  Query: {
    me: (_root: Record<string, unknown>, _arguments: Record<string, unknown>, { user }: { user?: User }): User | null => {
      if (__SERVER__) {
        console.error('-----------------------------------------------------------------------------------');
        console.error('StateLink ME.username: Boolean(user): [', Boolean(user), '], [', user?.username, ']');
        console.error('-----------------------------------------------------------------------------------');
        if (user) {
          const data = {
            ...user,
            groups: Array.isArray(user.groups)
              ? [
                  ...user.groups?.reduce((accumulator, element) => {
                    if (element.id && element.dn && element.loginService && element.name) {
                      return [...accumulator, { ...element, description: element.description || '', __typename: 'Group' }];
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
              companyEng: user.profile?.companyEng || null,
              managementEng: user.profile?.managementEng || null,
              departmentEng: user.profile?.departmentEng || null,
              divisionEng: user.profile?.divisionEng || null,
              positionEng: user.profile?.positionEng || null,

              telephone: user.profile?.telephone || null,
              workPhone: user.profile?.workPhone || null,
              fax: user.profile?.fax || null,
              mobile: user.profile?.mobile || null,
              email: user.profile?.email || null,

              country: user.profile?.country || null,
              postalCode: user.profile?.postalCode || null,
              region: user.profile?.region || null,
              street: user.profile?.street || null,
              town: user.profile?.town || null,
              room: user.profile?.room || null,

              accessCard: user.profile?.accessCard || null,
              dn: user.profile.dn || null,
              username: user.profile.username || null,
              fullName: user.profile.fullName || null,

              firstName: user.profile.firstName || null,
              lastName: user.profile.lastName || null,
              middleName: user.profile.middleName || null,
              birthday: user.profile.birthday || null,
              gender: user.profile.gender || null,

              company: user.profile?.company || null,
              title: user.profile?.title || null,

              management: user.profile?.management || null,
              department: user.profile?.department || null,
              division: user.profile?.division || null,

              employeeID: user.profile?.employeeID || null,

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
