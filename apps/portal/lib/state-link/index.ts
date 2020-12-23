/** @format */

import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';

export const resolvers = {
  Query: {
    // me: (_root: Record<string, unknown>, _arguments: Record<string, unknown>, { user }: { user?: User }): User | null => {
    //   throw new UnauthorizedException();
    // },
  },
};
