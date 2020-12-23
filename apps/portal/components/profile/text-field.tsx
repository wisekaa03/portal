/** @format */

//#region Imports NPM
import React, { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyQuery } from '@apollo/client';
import { TextField, OutlinedTextFieldProps, CircularProgress } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
//#endregion
//#region Imports Local
import { ProfileAutocompleteFields } from '@lib/types/profile';
import type { TextFieldComponentProps } from '@lib/types';
import { PROFILE_FIELD_SELECTION } from '@lib/queries';
import snackbarUtils from '@lib/snackbar-utils';
//#endregion

const ProfileTextFieldComponent: FC<TextFieldComponentProps> = ({ disabled, handleChange, field, value, InputProps, fullWidth = true }) => {
  const { t } = useTranslation();
  const autocomplete = field in ProfileAutocompleteFields;

  const [options, setOptions] = useState<string[]>([]);
  const [open, setOpen] = useState<boolean>(false);

  const [getOptions, { loading, data, error }] = useLazyQuery(PROFILE_FIELD_SELECTION, {
    ssr: false,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const handleOpen = (): void => {
    getOptions({ variables: { field } });
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  useEffect(() => {
    if (!loading && data?.profileFieldSelection) {
      setOptions(data.profileFieldSelection);
    }
  }, [loading, data]);

  useEffect(() => {
    if (error) {
      snackbarUtils.error(error);
    }
  }, [error]);

  const props: OutlinedTextFieldProps = {
    fullWidth,
    disabled,
    color: 'secondary',
    label: t(`phonebook:fields.${field}`),
    variant: 'outlined',
    InputProps,
  };

  if (autocomplete) {
    return (
      <Autocomplete
        autoHighlight
        clearOnEscape
        freeSolo={field !== 'manager'}
        // selectOnFocus
        clearOnBlur={field === 'manager'}
        forcePopupIcon
        noOptionsText={t('profile:edit.notFound')}
        clearText={t('profile:edit.clear')}
        openText={t('profile:edit.open')}
        loadingText={t('profile:edit.loading')}
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
        loading={loading}
        options={options}
        value={value}
        onChange={(event: any, valueChanged: any) => handleChange && handleChange(field)(event, valueChanged)}
        renderInput={(parameters: Record<string, any>) => (
          <TextField
            {...props}
            {...parameters}
            InputProps={{
              ...InputProps,
              ...parameters.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {parameters.InputProps.endAdornment}
                  {/* InputProps.endAdornment */}
                </>
              ),
            }}
          />
        )}
      />
    );
  }

  return (
    <TextField
      {...props}
      value={value || ''}
      InputProps={InputProps}
      onChange={
        handleChange && ((handleChange(field) as unknown) as (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void)
      }
    />
  );
};

export default ProfileTextFieldComponent;
