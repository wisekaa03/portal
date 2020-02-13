/** @format */

import { GraphQLError } from 'graphql';
import { I18nService } from 'nestjs-i18n';

const dev = process.env.NODE_ENV !== 'production';

export enum GQLErrorCode {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  SERVER_PARAMS = 'SERVER_PARAMS',
}

interface GQLErrorParams {
  error: Error;
  code?: GQLErrorCode;
  i18n?: I18nService;
}

export const GQLError = ({ error, i18n, code = GQLErrorCode.UNAUTHENTICATED }: GQLErrorParams): GraphQLError => {
  let { message } = error;

  if (code === GQLErrorCode.UNAUTHENTICATED && i18n) {
    message = i18n.translate('auth.LOGIN.INCORRECT');
  }

  return new GraphQLError(message, undefined, undefined, undefined, undefined, dev ? error : undefined, {
    code,
  });
};
