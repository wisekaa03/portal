/** @format */

// #region Imports NPM
import { GraphQLError } from 'graphql';
import { I18nService } from 'nestjs-i18n';
// #endregion
// #region Imports Local
// #endregion

const dev = process.env.NODE_ENV !== 'production';

export enum GQLErrorCode {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  UNAUTHENTICATED_LOGIN = 'UNAUTHENTICATED_LOGIN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SERVER_PARAMS = 'SERVER_PARAMS',
  INSUFF_RIGHTS_AD = 'INSUFF_RIGHTS_AD',
}

interface GQLErrorParams {
  code: GQLErrorCode;
  error?: Error;
  i18n?: I18nService;
}

export const GQLError = ({ error, i18n, code = GQLErrorCode.UNAUTHENTICATED }: GQLErrorParams): GraphQLError => {
  let message: string;

  if (error) {
    message = error.message;
  }

  switch (code) {
    case GQLErrorCode.UNAUTHENTICATED:
      message = i18n ? i18n.translate('auth.UNAUTHENTICATED') : 'Not authenticated';
      break;
    case GQLErrorCode.UNAUTHENTICATED_LOGIN:
      message = i18n ? i18n.translate('auth.LOGIN_INCORRECT') : 'Invalid username/password';
      break;
    case GQLErrorCode.UNAUTHORIZED:
      message = i18n ? i18n.translate('auth.UNAUTHORIZED') : 'Not authorized';
      break;
    case GQLErrorCode.INSUFF_RIGHTS_AD:
      message = i18n ? i18n.translate('auth.INSUFF_RIGHTS_AD') : 'Not enough right to edit Active Directory';
      break;
    default:
      message = i18n ? i18n.translate('auth.SERVER_ERROR') : 'Server error';
      break;
  }

  return new GraphQLError(message, undefined, undefined, undefined, undefined, dev ? error : undefined, { code });
};
