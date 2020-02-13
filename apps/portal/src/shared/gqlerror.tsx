/** @format */

import { GraphQLError } from 'graphql';
import { I18nService } from 'nestjs-i18n';

const dev = process.env.NODE_ENV !== 'production';

export enum GQLErrorCode {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  SERVER_PARAMS = 'SERVER_PARAMS',
  INSUFF_RIGHTS = 'INSUFF_RIGHTS',
}

interface GQLErrorParams {
  error: Error;
  code?: GQLErrorCode;
  i18n?: I18nService;
}

export const GQLError = ({ error, i18n, code = GQLErrorCode.UNAUTHENTICATED }: GQLErrorParams): GraphQLError => {
  let { message } = error;

  if (i18n) {
    switch (code) {
      case GQLErrorCode.UNAUTHENTICATED:
        message = i18n.translate('auth.LOGIN.INCORRECT');
        break;
      case GQLErrorCode.INSUFF_RIGHTS:
        message = i18n.translate('auth.INSUFF_RIGHTS');
        break;
      default:
        message = i18n.translate('auth.SERVER_ERROR');
        break;
    }
  }

  return new GraphQLError(message, undefined, undefined, undefined, undefined, dev ? error : undefined, {
    code,
  });
};
