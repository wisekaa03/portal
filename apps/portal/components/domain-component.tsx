/** @format */

//#region Imports NPM
import React, { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyQuery } from '@apollo/client';
import { TextField, OutlinedTextFieldProps, CircularProgress } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
//#endregion
//#region Imports Local
import { Data, DomainComponentProps } from '@lib/types';
import { AVAILABLE_DOMAIN } from '@lib/queries';
import snackbarUtils from '@lib/snackbar-utils';
//#endregion

const DomainComponent: FC<DomainComponentProps> = ({ disabled = false, handleDomain, domain, InputProps = {}, fullWidth = true }) => {
  const { t } = useTranslation();

  const [options, setOptions] = useState<string[]>([]);
  const [openDomain, setOpenDomain] = useState<boolean>(false);

  const [getDomain, { loading: loadingDomain, data: dataDomain, error: errorDomain, called: calledDomain }] = useLazyQuery<
    Data<'availableAuthenticationProfiles', string[]>
  >(AVAILABLE_DOMAIN, {
    ssr: true,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const handleOpen = (): void => {
    getDomain();
    setOpenDomain(true);
  };

  const handleClose = (): void => {
    setOpenDomain(false);
  };

  useEffect(() => {
    if (!loadingDomain && dataDomain?.availableAuthenticationProfiles) {
      setOptions(dataDomain.availableAuthenticationProfiles);
    }
  }, [loadingDomain, dataDomain]);

  useEffect(() => {
    if (!calledDomain && !domain) {
      getDomain();
    }
  }, [calledDomain, getDomain, domain]);

  useEffect(() => {
    if (errorDomain) {
      snackbarUtils.error(errorDomain);
    }
  }, [errorDomain]);

  const propsDomain: OutlinedTextFieldProps = {
    fullWidth,
    disabled,
    color: 'secondary',
    label: t('common:domain.name'),
    variant: 'outlined',
    InputProps,
  };

  return (
    <Autocomplete
      disabled={disabled}
      autoHighlight
      forcePopupIcon
      disableClearable
      noOptionsText={t('common:domain.noOptions')}
      clearText={t('common:domain.clearText')}
      openText={t('common:domain.open')}
      loadingText={t('common:domain.loading')}
      options={options}
      open={openDomain}
      onOpen={handleOpen}
      onClose={handleClose}
      loading={loadingDomain}
      value={domain}
      onChange={handleDomain}
      renderInput={(parameters) => (
        <TextField
          {...propsDomain}
          {...parameters}
          InputProps={{
            ...parameters.InputProps,
            endAdornment: (
              <>
                {loadingDomain ? <CircularProgress color="inherit" size={20} /> : null}
                {parameters.InputProps.endAdornment}
                {/* InputProps.endAdornment */}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default DomainComponent;
