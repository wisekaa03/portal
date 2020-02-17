/** @format */

import React from 'react';
import { useSnackbar, VariantType, WithSnackbarProps } from 'notistack';
import { ApolloError } from 'apollo-client';

interface SnackbarUtilsProps {
  setUseSnackbarRef: (showSnackbar: WithSnackbarProps) => void;
}

const InnerSnackbarUtilsConfigurator: React.FC<SnackbarUtilsProps> = (props: SnackbarUtilsProps) => {
  props.setUseSnackbarRef(useSnackbar());
  return null;
};

let useSnackbarRef: WithSnackbarProps;

const setUseSnackbarRef = (useSnackbarRefProp: WithSnackbarProps): void => {
  useSnackbarRef = useSnackbarRefProp;
};

export const SnackbarUtilsConfigurator = (): React.ReactElement => {
  return <InnerSnackbarUtilsConfigurator setUseSnackbarRef={setUseSnackbarRef} />;
};

export default {
  show(errors: ApolloError, variant: VariantType = 'error') {
    errors.graphQLErrors.forEach((error) => {
      useSnackbarRef.enqueueSnackbar(error.message, { variant });
    });

    if (errors.networkError) {
      useSnackbarRef.enqueueSnackbar(errors.networkError.message, { variant });
    }
  },
};
