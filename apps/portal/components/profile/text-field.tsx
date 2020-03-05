/** @format */

// #region Imports NPM
import React, { FC, useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import { TextField, OutlinedTextFieldProps, CircularProgress } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
// #endregion
// #region Imports Local
import { useTranslation } from 'react-i18next';
import { TextFieldComponentProps } from './types';
import { PROFILE_AUTOCOMPLETE_FIELDS } from '../../lib/constants';
import { PROFILE_FIELD_SELECTION } from '../../lib/queries';
import snackbarUtils from '../../lib/snackbar-utils';
// #endregion

const ProfileTextFieldComponent: FC<TextFieldComponentProps> = ({
  disabled,
  handleChange,
  field,
  value,
  InputProps,
}) => {
  const { t } = useTranslation();
  const autocomplete = PROFILE_AUTOCOMPLETE_FIELDS.includes(field);
  const [options, setOptions] = useState<string[]>([]);
  const [open, setOpen] = useState<boolean>(false);

  const [getOptions, { loading, data, error }] = useLazyQuery(PROFILE_FIELD_SELECTION);

  const handleFieldSelection = (variable = 'country') => (): void => {
    getOptions({ variables: { field: variable } });
  };

  const handleOpen = (): void => {
    handleFieldSelection(field)();
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
    fullWidth: true,
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
        freeSolo
        noOptionsText={t('profile:edit.notFound')}
        clearText={t('profile:edit.clear')}
        openText={t('profile:edit.open')}
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
        loading={loading}
        options={options}
        value={value}
        onChange={(event, newValue) => handleChange(field, newValue)(event)}
        renderInput={(params) => (
          <TextField
            {...props}
            {...params}
            InputProps={{
              ...InputProps,
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                  {/* InputProps.endAdornment */}
                </>
              ),
            }}
          />
        )}
      />
    );
  }

  return <TextField {...props} value={value || ''} InputProps={InputProps} onChange={handleChange(field)} />;
};

export default ProfileTextFieldComponent;
