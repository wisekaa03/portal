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
  NO_FIELDS_ARE_FILLED_WITH_PROFILE = 'NO_FIELDS_ARE_FILLED_WITH_PROFILE',
  CONSTRAINT_VIOLATION_ERROR = 'CONSTRAINT_VIOLATION_ERROR',
}

interface GQLErrorParams {
  code: GQLErrorCode;
  error?: Error;
  i18n?: I18nService;
}

export const GQLError = ({ error, i18n, code = GQLErrorCode.UNAUTHENTICATED }: GQLErrorParams): GraphQLError => {
  let message: string;

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
    case GQLErrorCode.NO_FIELDS_ARE_FILLED_WITH_PROFILE:
      message = i18n ? i18n.translate('auth.NO_FIELDS_ARE_FILLED_WITH_PROFILE') : 'No fields are filled with profile';
      break;
    case GQLErrorCode.CONSTRAINT_VIOLATION_ERROR:
      message = i18n ? i18n.translate('auth.CONSTRAINT_VIOLATION_ERROR') : 'Constraint violation error';
      break;
    default:
      message = i18n ? i18n.translate('auth.SERVER_ERROR') : 'Server error';
      break;
  }

  return new GraphQLError(message, undefined, undefined, undefined, undefined, dev ? error : undefined, { code });
};
