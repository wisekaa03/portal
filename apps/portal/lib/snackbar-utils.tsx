/** @format */

import React from 'react';
import { useSnackbar, VariantType, WithSnackbarProps } from 'notistack';
import { ApolloError } from 'apollo-client';
// TODO: хз почему не работает
// import { UseTranslationResponse } from 'react-i18next';
import { useTranslation } from './i18n-client';

interface SnackbarUtilsProps {
  setUseSnackbarRef: (showSnackbar: WithSnackbarProps) => void;
  setUseTranslationRef: (useTranslation: any) => void;
}

const InnerSnackbarUtilsConfigurator: React.FC<SnackbarUtilsProps> = (props: SnackbarUtilsProps) => {
  props.setUseSnackbarRef(useSnackbar());
  props.setUseTranslationRef(useTranslation());
  return null;
};

let useSnackbarRef: WithSnackbarProps;
let useTranslationRef: any;

const setUseSnackbarRef = (useSnackbarRefProp: WithSnackbarProps): void => {
  useSnackbarRef = useSnackbarRefProp;
};

const setUseTranslationRef = (useTranslationRefProp: any): void => {
  useTranslationRef = useTranslationRefProp;
};

export const SnackbarUtilsConfigurator = (): React.ReactElement => {
  return (
    <InnerSnackbarUtilsConfigurator setUseSnackbarRef={setUseSnackbarRef} setUseTranslationRef={setUseTranslationRef} />
  );
};

export default {
  error(errors: ApolloError) {
    const { t } = useTranslationRef;

    errors.graphQLErrors.forEach(({ message }) => {
      this.show(t('common:error', { message }));
    });

    if (errors.networkError) {
      const { message } = errors.networkError;
      this.show(t('common:error', { message }));
    }
  },
  show: (message: string, variant: VariantType = 'error') => useSnackbarRef.enqueueSnackbar(message, { variant }),
};
