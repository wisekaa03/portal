/** @format */

// #region Imports NPM
import React, { FC } from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Divider,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import { useRouter } from 'next/router';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import EditIcon from '@material-ui/icons/Edit';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
// #endregion
// #region Imports Local
import { Profile } from '@app/portal/profile/models/profile.dto';
import IsAdmin from '../isAdmin';
import Avatar from '../ui/avatar';
import Loading from '../loading';
import { useTranslation } from '../../lib/i18n-client';
import Button from '../ui/button';
import { Gender } from '../../src/shared/interfaces';
import { DropzoneWrapper } from '../dropzone';
import { ProfileEditComponentProps, TextFieldComponentProps } from './types';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    firstBlock: {
      display: 'grid',
      gap: `${theme.spacing(2)}px`,
      width: '100%',
      [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: '1fr 1fr',
      },
    },
    secondBlock: {
      display: 'grid',
      gap: `${theme.spacing(2)}px`,
      width: '100%',
      [theme.breakpoints.up('md')]: {
        gridTemplateColumns: '1fr 1fr',
      },
      [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
      },
    },
    thirdBlock: {
      display: 'grid',
      width: '100%',
    },
    nameEngBlock: {
      'display': 'flex',
      'flex': 1,
      'justifyContent': 'flex-end',
      'flexDirection': 'column',
      'padding': theme.spacing(),
      'backgroundColor': fade(theme.palette.secondary.main, 0.05),
      'color': theme.palette.secondary.main,
      '& > div:not(:last-child)': {
        marginBottom: theme.spacing(),
      },
      '& > label': {
        margin: 0,
      },
    },
    avatar: {
      height: 220,
      width: 220,
      objectFit: 'contain',
      borderRadius: theme.spacing(0.5),
    },
    nameBlock: {
      'display': 'flex',
      'flex': 1,
      'justifyContent': 'center',
      'flexDirection': 'column',
      'padding': theme.spacing(),
      'backgroundColor': fade(theme.palette.secondary.main, 0.05),
      'color': theme.palette.secondary.main,
      '& > div:not(:last-child)': {
        marginBottom: theme.spacing(2),
      },
      '& > label': {
        margin: 0,
      },
    },
    genderBlock: {
      'flexDirection': 'row',
      '& > label': {
        margin: 0,
      },
    },
    hr: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    pickPhoto: {
      'position': 'absolute',
      'zIndex': 100,
      'width': 220,
      'height': 220,
      'borderRadius': theme.spacing(0.5),
      'color': '#fff',
      'opacity': 0,
      'transition': theme.transitions.create('opacity', {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.leavingScreen,
      }),
      '&:hover': {
        background: '#000',
        opacity: 0.4,
      },
    },
    notFound: {
      marginTop: theme.spacing(2),
      textAlign: 'center',
      color: '#949494',
    },
    loadingBackground: {
      transition: theme.transitions.create('background', {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.leavingScreen,
      }),
      background: '#0000001a',
      zIndex: 1,
    },
  }),
);

const endAdornment = (
  <InputAdornment position="end">
    <EditIcon color="secondary" />
  </InputAdornment>
);

const TextFieldComponent: FC<TextFieldComponentProps> = ({ disabled, handleChange, field, value, InputProps }) => {
  const { t } = useTranslation();

  return (
    <TextField
      fullWidth
      disabled={disabled}
      onChange={handleChange(field)}
      color="secondary"
      value={value || ''}
      label={t(`phonebook:fields.${field}`)}
      variant="outlined"
      InputProps={InputProps}
    />
  );
};

const names: (keyof Profile)[] = ['lastName', 'firstName', 'middleName'];
const companyes: (keyof Profile)[] = ['company', 'department', 'otdel', 'title'];
const langs: (keyof Profile)[] = ['companyeng', 'departmenteng', 'otdeleng', 'positioneng'];
const others: (keyof Profile)[] = [
  'email',
  'telephone',
  'mobile',
  'workPhone',
  'country',
  'region',
  'town',
  'street',
  'postalCode',
  'employeeID',
];

const ProfileEditComponent: FC<ProfileEditComponentProps> = ({
  isAdmin,
  loadingProfile,
  loadingChanged,
  hasUpdate,
  profile,
  onDrop,
  handleChange,
  handleBirthday,
  handleSave,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();
  const router = useRouter();

  const InputProps = isAdmin ? { endAdornment } : { readOnly: true };

  return (
    <Box display="flex" flexDirection="column">
      <Loading activate={!profile} noMargin type="linear" variant="indeterminate" />
      <Box display="flex" flexDirection="column" p={2} overflow="auto">
        <Box display="flex" mb={1}>
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
          <IsAdmin>
            <Box flex={1} display="flex" alignItems="center" justifyContent="flex-end">
              <Button disabled={!hasUpdate} onClick={handleSave}>
                {t('common:accept')}
              </Button>
            </Box>
          </IsAdmin>
        </Box>
        <Box display="flex" position="relative" flexDirection="column">
          <Loading activate={loadingProfile} noMargin type="linear" variant="indeterminate">
            {profile ? (
              <>
                <Loading
                  activate={loadingChanged}
                  full
                  wrapperClasses={classes.loadingBackground}
                  absolute
                  color="secondary"
                  size={48}
                  type="circular"
                />
                <div className={classes.firstBlock}>
                  <Box display="flex">
                    <Box mr={1} position="relative">
                      <DropzoneWrapper onDrop={onDrop}>
                        <IconButton className={classes.pickPhoto}>
                          <PhotoCameraIcon />
                        </IconButton>
                        <Avatar fullSize className={classes.avatar} profile={profile} alt="photo" />
                      </DropzoneWrapper>
                    </Box>
                    <div className={classes.nameBlock}>
                      {names.map((field) => (
                        <TextFieldComponent
                          key={field}
                          disabled={loadingChanged}
                          handleChange={handleChange}
                          field={field}
                          value={profile[field]}
                          InputProps={InputProps}
                        />
                      ))}
                    </div>
                  </Box>
                  <div className={classes.thirdBlock}>
                    <div className={classes.nameBlock}>
                      <div className={classes.genderBlock}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              disabled={loadingChanged}
                              checked={profile.notShowing}
                              onChange={handleChange('notShowing')}
                              color="secondary"
                              value="notShowing"
                            />
                          }
                          label={t('phonebook:fields.notShowing')}
                        />
                      </div>
                      <div className={classes.genderBlock}>
                        <RadioGroup
                          className={classes.genderBlock}
                          onChange={handleChange('gender')}
                          aria-label="gender"
                          name="gender"
                          value={profile.gender}
                        >
                          <FormControlLabel
                            disabled={loadingChanged}
                            value={Gender.MAN}
                            control={<Radio color="secondary" />}
                            label={t('common:gender.MAN')}
                            name="gender"
                            labelPlacement="end"
                          />
                          <FormControlLabel
                            disabled={loadingChanged}
                            value={Gender.WOMAN}
                            control={<Radio color="secondary" />}
                            label={t('common:gender.WOMAN')}
                            name="gender"
                            labelPlacement="end"
                          />
                        </RadioGroup>
                      </div>
                    </div>
                    <div className={classes.nameEngBlock}>
                      <TextFieldComponent
                        disabled={loadingChanged}
                        handleChange={handleChange}
                        field="nameeng"
                        value={profile.nameeng}
                        InputProps={InputProps}
                      />
                    </div>
                  </div>
                  <div className={classes.nameBlock}>
                    {companyes.map((field) => (
                      <TextFieldComponent
                        key={field}
                        disabled={loadingChanged}
                        handleChange={handleChange}
                        field={field}
                        value={profile[field]}
                        InputProps={InputProps}
                      />
                    ))}
                  </div>
                  <div className={classes.nameBlock}>
                    {langs.map((field) => (
                      <TextFieldComponent
                        key={field}
                        disabled={loadingChanged}
                        handleChange={handleChange}
                        field={field}
                        value={profile[field]}
                        InputProps={InputProps}
                      />
                    ))}
                  </div>
                </div>
                <Divider className={classes.hr} />
                <div className={classes.secondBlock}>
                  <div>
                    <TextFieldComponent
                      disabled={loadingChanged}
                      handleChange={handleChange}
                      field="manager"
                      value={profile.manager?.fullName}
                      InputProps={{ readOnly: true }}
                    />
                  </div>
                  <div>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <KeyboardDatePicker
                        fullWidth
                        disabled={loadingChanged}
                        inputVariant="outlined"
                        color="secondary"
                        format="yyyy-MM-dd"
                        label={t('phonebook:fields.birthday')}
                        value={profile.birthday}
                        onChange={handleBirthday}
                        KeyboardButtonProps={{
                          'aria-label': 'change birthday',
                        }}
                      />
                    </MuiPickersUtilsProvider>
                  </div>
                  {others.map((field) => (
                    <div key={field}>
                      <TextFieldComponent
                        disabled={loadingChanged}
                        handleChange={handleChange}
                        field={field}
                        value={profile[field]}
                        InputProps={InputProps}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Typography className={classes.notFound} variant="h4">
                {t('profile:notFound')}
              </Typography>
            )}
          </Loading>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileEditComponent;
