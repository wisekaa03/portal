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

const DomainComponent: FC<DomainComponentProps> = ({
  newProfile = false,
  disabled = false,
  handleDomain,
  domain,
  InputProps = {},
  fullWidth = true,
}) => {
  const { t } = useTranslation();

  const [rawDomain, setDomain] = useState<string>((domain as string) || '');
  const [options, setOptions] = useState<string[]>(['']);
  const [openDomain, setOpenDomain] = useState<boolean>(false);

  const [getDomain, { loading: loadingDomain, data: dataDomain, error: errorDomain, called: calledDomain }] = useLazyQuery<
    Data<'availableAuthenticationProfiles', string[]>,
    { synchronization?: boolean; newProfile?: boolean }
  >(AVAILABLE_DOMAIN, {
    ssr: true,
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const handleOpen = (): void => {
    getDomain({ variables: { newProfile } });
    setOpenDomain(true);
  };

  const handleClose = (): void => {
    setOpenDomain(false);
  };

  useEffect(() => {
    if (
      !loadingDomain &&
      dataDomain?.availableAuthenticationProfiles &&
      Array.isArray(dataDomain.availableAuthenticationProfiles) &&
      dataDomain.availableAuthenticationProfiles.length > 0
    ) {
      if (!rawDomain && handleDomain) {
        setDomain(dataDomain.availableAuthenticationProfiles[0]);
        handleDomain(dataDomain.availableAuthenticationProfiles[0]);
      }
      setOptions(dataDomain.availableAuthenticationProfiles);
    }
  }, [loadingDomain, handleDomain, rawDomain, dataDomain?.availableAuthenticationProfiles]);

  useEffect(() => {
    if (!calledDomain && !domain) {
      getDomain({ variables: { newProfile } });
    }
  }, [calledDomain, getDomain, domain, newProfile]);

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
      value={rawDomain}
      onChange={(event: React.SyntheticEvent<Element, Event>, value: string) => handleDomain && handleDomain(value)}
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
