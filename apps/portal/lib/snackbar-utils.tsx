/** @format */

import React from 'react';
import { useSnackbar, VariantType, WithSnackbarProps } from 'notistack';
import { GraphQLError } from 'graphql';
import { ApolloError } from '@apollo/client';
// TODO: хз почему не работает
// import { UseTranslationResponse } from 'react-i18next';
import { useTranslation } from './i18n-client';

interface SnackbarUtilsProps {
  setUseSnackbarRef: (showSnackbar: WithSnackbarProps) => void;
  setUseTranslationRef: (_: any) => void;
}

const InnerSnackbarUtilsConfigurator: React.FC<SnackbarUtilsProps> = ({ setUseSnackbarRef, setUseTranslationRef }: SnackbarUtilsProps) => {
  setUseSnackbarRef(useSnackbar());
  setUseTranslationRef(useTranslation());

  return null;
};

let useSnackbarRef: WithSnackbarProps;
let useTranslationRef: any;

const setUseSnackbarRef = (useSnackbarRefProperty: WithSnackbarProps): void => {
  useSnackbarRef = useSnackbarRefProperty;
};

const setUseTranslationRef = (useTranslationRefProperty: any): void => {
  useTranslationRef = useTranslationRefProperty;
};

export const SnackbarUtilsConfigurator = (): React.ReactElement => (
  <InnerSnackbarUtilsConfigurator setUseSnackbarRef={setUseSnackbarRef} setUseTranslationRef={setUseTranslationRef} />
);

export default {
  error(errors: ApolloError | readonly GraphQLError[] | string): void {
    const { t } = useTranslationRef;

    if (typeof errors === 'string') {
      this.show(t('common:error', { message: errors }));
    } else if (errors instanceof ApolloError) {
      errors.graphQLErrors.forEach(({ message }) => {
        if (typeof message === 'object') {
          this.show(t('common:error', { message: (message as any).error }));
        } else {
          this.show(t('common:error', { message }));
        }
      });

      if (errors.networkError) {
        const { message } = errors.networkError;
        this.show(t('common:error', { message }));
      }
    } else if (errors instanceof GraphQLError) {
      errors.forEach(({ message }) => {
        if (typeof message === 'object') {
          this.show(t('common:error', { message: (message as any).error }));
        } else {
          this.show(t('common:error', { message }));
        }
      });
    }
  },

  show: (message: string, variant: VariantType = 'error'): string | number => useSnackbarRef.enqueueSnackbar(message, { variant }),
};
