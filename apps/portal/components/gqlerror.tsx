/** @format */

// #region Imports NPM
import { ApolloError } from 'apollo-client';
import { TFunction } from 'i18next';
// #endregion
// #region Imports Local
// #endregion

interface GQLErrorProps {
  enqueueSnackbar: any;
  errors: ApolloError;
  t?: TFunction;
}

export const GQLError = ({ enqueueSnackbar, errors }: GQLErrorProps): void => {
  errors.graphQLErrors.forEach((error) => {
    enqueueSnackbar(error.message, { variant: 'error' });
  });

  if (errors.networkError) {
    enqueueSnackbar(errors.networkError.message, { variant: 'error' });
  }
};
