/** @format */

import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { User, UserSettingsTaskFavorite, PhonebookColumnNames } from '@lib/types';
import { FONT_SIZE_NORMAL } from '../constants';
import { Group } from '../types/group.dto';

export const resolvers = {
  Query: {
    // me: (_root: Record<string, unknown>, _arguments: Record<string, unknown>, { user }: { user?: User }): User | null => {
    //   throw new UnauthorizedException();
    // },
  },
};
