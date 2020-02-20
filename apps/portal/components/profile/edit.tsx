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
import Link from 'next/link';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import EditIcon from '@material-ui/icons/Edit';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
// #endregion
// #region Imports Local
import IsAdmin from '../isAdmin';
import Avatar from '../ui/avatar';
import Loading from '../loading';
import { useTranslation } from '../../lib/i18n-client';
import Button from '../ui/button';
import { Gender } from '../../src/shared/interfaces';
import { DropzoneWrapper } from '../dropzone';
import { ProfileEditComponentProps } from './types';
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
      height: 200,
      width: 200,
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
      'width': 200,
      'height': 200,
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
  }),
);

const endAdornment = (
  <InputAdornment position="end">
    <EditIcon color="secondary" />
  </InputAdornment>
);

const ProfileEditComponent: FC<ProfileEditComponentProps> = ({
  isAdmin,
  loadingProfile,
  loadingChanged,
  profile,
  onDrop,
  handleChange,
  handleBirthday,
  handleSave,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  const InputProps = isAdmin ? { endAdornment } : { readOnly: true };

  return (
    <Box display="flex" flexDirection="column">
      <Loading activate={!profile} noMargin type="linear" variant="indeterminate" />
      <Box display="flex" flexDirection="column" p={2} overflow="auto">
        <Box display="flex" mb={1}>
          <Link href={{ pathname: '/profile' }} as="/profile" passHref>
            <IconButton>
              <ArrowBackIcon />
            </IconButton>
          </Link>
          <IsAdmin>
            <Box flex={1} display="flex" alignItems="center" justifyContent="flex-end">
              <Button onClick={handleSave}>{t('common:accept')}</Button>
            </Box>
          </IsAdmin>
        </Box>
        <Box display="flex" flexDirection="column">
          <Loading activate={loadingProfile} noMargin type="linear" variant="indeterminate">
            {!loadingProfile && profile ? (
              <>
                <Loading activate={loadingChanged} full absolute color="secondary" size={48} type="circular" />
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
                      <TextField
                        fullWidth
                        disabled={loadingChanged}
                        onChange={handleChange('lastName')}
                        color="secondary"
                        value={profile.lastName || ''}
                        label={t('phonebook:fields.lastName')}
                        variant="outlined"
                        InputProps={InputProps}
                      />
                      <TextField
                        fullWidth
                        disabled={loadingChanged}
                        onChange={handleChange('firstName')}
                        color="secondary"
                        value={profile.firstName || ''}
                        label={t('phonebook:fields.firstName')}
                        variant="outlined"
                        InputProps={InputProps}
                      />
                      <TextField
                        fullWidth
                        disabled={loadingChanged}
                        onChange={handleChange('middleName')}
                        color="secondary"
                        value={profile.middleName || ''}
                        label={t('phonebook:fields.middleName')}
                        variant="outlined"
                        InputProps={InputProps}
                      />
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
                      <TextField
                        fullWidth
                        disabled={loadingChanged}
                        onChange={handleChange('nameeng')}
                        color="secondary"
                        value={profile.nameeng || ''}
                        label={t('phonebook:fields.nameeng')}
                        variant="outlined"
                        InputProps={InputProps}
                      />
                    </div>
                  </div>
                  <div className={classes.nameBlock}>
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('company')}
                      color="secondary"
                      value={profile.company || ''}
                      label={t('phonebook:fields.company')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('department')}
                      color="secondary"
                      value={profile.department || ''}
                      label={t('phonebook:fields.department')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('otdel')}
                      color="secondary"
                      value={profile.otdel || ''}
                      label={t('phonebook:fields.otdel')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('title')}
                      color="secondary"
                      value={profile.title || ''}
                      label={t('phonebook:fields.title')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                  </div>
                  <div className={classes.nameBlock}>
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('companyeng')}
                      color="secondary"
                      value={profile.companyeng || ''}
                      label={t('phonebook:fields.companyeng')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('departmenteng')}
                      color="secondary"
                      value={profile.departmenteng || ''}
                      label={t('phonebook:fields.departmenteng')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('otdeleng')}
                      color="secondary"
                      value={profile.otdeleng || ''}
                      label={t('phonebook:fields.otdeleng')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('positioneng')}
                      color="secondary"
                      value={profile.positioneng || ''}
                      label={t('phonebook:fields.positioneng')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                  </div>
                </div>
                <Divider className={classes.hr} />
                <div className={classes.secondBlock}>
                  <div>
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('manager')}
                      color="secondary"
                      value={profile.manager?.fullName || ''}
                      label={t('phonebook:fields.manager')}
                      variant="outlined"
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
                  <div>
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('email')}
                      color="secondary"
                      value={profile.email || ''}
                      label={t('phonebook:fields.email')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                  </div>
                  <div>
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('telephone')}
                      color="secondary"
                      value={profile.telephone || ''}
                      label={t('phonebook:fields.telephone')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                  </div>
                  <div>
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('mobile')}
                      color="secondary"
                      value={profile.mobile || ''}
                      label={t('phonebook:fields.mobile')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                  </div>
                  <div>
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('workPhone')}
                      color="secondary"
                      value={profile.workPhone || ''}
                      label={t('phonebook:fields.workPhone')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                  </div>
                  <div>
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('country')}
                      color="secondary"
                      value={profile.country || ''}
                      label={t('phonebook:fields.country')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                  </div>
                  <div>
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('region')}
                      color="secondary"
                      value={profile.region || ''}
                      label={t('phonebook:fields.region')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                  </div>
                  <div>
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('town')}
                      color="secondary"
                      value={profile.town || ''}
                      label={t('phonebook:fields.town')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                  </div>
                  <div>
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('street')}
                      color="secondary"
                      value={profile.street || ''}
                      label={t('phonebook:fields.street')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                  </div>
                  <div>
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('postalCode')}
                      color="secondary"
                      value={profile.postalCode || ''}
                      label={t('phonebook:fields.postalCode')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                  </div>
                  <div>
                    <TextField
                      fullWidth
                      disabled={loadingChanged}
                      onChange={handleChange('employeeID')}
                      color="secondary"
                      value={profile.employeeID || ''}
                      label={t('phonebook:fields.employeeID')}
                      variant="outlined"
                      InputProps={InputProps}
                    />
                  </div>
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
