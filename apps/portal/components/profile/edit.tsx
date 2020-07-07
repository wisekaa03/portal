/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Box,
  IconButton,
  InputAdornment,
  Divider,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Typography,
  Select,
  MenuItem,
} from '@material-ui/core';
import { useRouter } from 'next/router';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import EditIcon from '@material-ui/icons/Edit';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { Gender, Profile, ProfileEditComponentProps, Contact } from '@lib/types';
import IsAdmin from '@front/components/isAdmin';
import Avatar from '@front/components/ui/avatar';
import Loading from '@front/components/loading';
import Button from '@front/components/ui/button';
import { DropzoneWrapper } from '@front/components/dropzone';
import ProfileTextFieldComponent from './text-field';
import { FormControl, InputLabel } from '@material-ui/core';
//#endregion

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
      marginTop: '2px',
      width: '100%',
      borderRadius: theme.shape.borderRadius,
    },
    topRightBlock: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'nowrap',
      alignItems: 'stretch',
    },
    fullNameBlock: {
      [theme.breakpoints.down('xs')]: {
        'flexDirection': 'column',
        'alignItems': 'center',
        '& > div:first-child': {
          marginBottom: theme.spacing(),
        },
      },
    },
    avatar: {
      height: 220,
      width: 220,
      objectFit: 'contain',
      borderRadius: theme.shape.borderRadius,
    },
    nameBlock: {
      'width': '100%',
      'display': 'flex',
      'flex': 1,
      'justifyContent': 'center',
      'flexDirection': 'column',
      'padding': theme.spacing(),
      'borderRadius': theme.shape.borderRadius,
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
        margin: '7px 7px 6px 7px',
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
      'borderRadius': theme.shape.borderRadius,
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

const names: (keyof Profile)[] = ['lastName', 'firstName', 'middleName'];
const companyes: (keyof Profile)[] = ['company', 'management', 'department', 'division', 'title'];
const langs: (keyof Profile)[] = ['companyEng', 'managementEng', 'departmentEng', 'divisionEng', 'positionEng'];
const others: (keyof Profile)[] = [
  'email',
  'telephone',
  'mobile',
  'workPhone',
  'country',
  'region',
  'town',
  'street',
  'room',
  'postalCode',
  'employeeID',
  'accessCard',
];

const ProfileEditComponent: FC<ProfileEditComponentProps> = ({
  isAdmin,
  newProfile = true,
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
                {newProfile ? t('common:save') : t('common:accept')}
              </Button>
            </Box>
          </IsAdmin>
        </Box>
        <Loading
          activate={loadingProfile}
          wrapperClasses={classes.loadingBackground}
          absolute
          full
          noMargin
          type="circular"
          size={48}
          color="secondary"
          variant="indeterminate"
        >
          <Box display="flex" position="relative" flexDirection="column">
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
                  <Box display="flex" className={classes.fullNameBlock}>
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
                        <ProfileTextFieldComponent
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
                      <div className={classes.topRightBlock}>
                        <FormControl disabled={!newProfile} variant="outlined">
                          <InputLabel id="profile-contact">{t('phonebook:contact.title')}</InputLabel>
                          <Select
                            labelId="profile-contact"
                            autoWidth
                            onChange={handleChange('contact')}
                            color="secondary"
                            value={profile.contact}
                            label={t('phonebook:contact.title')}
                          >
                            <MenuItem value="USER">{t('phonebook:contact.user')}</MenuItem>
                            <MenuItem value="PROFILE">{t('phonebook:contact.profile')}</MenuItem>
                          </Select>
                        </FormControl>
                        {profile.contact === Contact.USER && (
                          <ProfileTextFieldComponent
                            disabled={!newProfile}
                            handleChange={handleChange}
                            field="username"
                            value={profile.username}
                            InputProps={newProfile ? InputProps : { readOnly: true }}
                            fullWidth={false}
                          />
                        )}
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
                      <ProfileTextFieldComponent
                        disabled={loadingChanged}
                        handleChange={handleChange}
                        field="nameEng"
                        value={profile.nameEng}
                        InputProps={InputProps}
                      />
                    </div>
                  </div>
                  <div className={classes.nameBlock}>
                    {companyes.map((field) => (
                      <ProfileTextFieldComponent
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
                      <ProfileTextFieldComponent
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
                    <ProfileTextFieldComponent
                      disabled={loadingChanged}
                      handleChange={handleChange}
                      field="manager"
                      value={profile.manager?.fullName}
                      InputProps={InputProps}
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
                      <ProfileTextFieldComponent
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
          </Box>
        </Loading>
      </Box>
    </Box>
  );
};

export default ProfileEditComponent;
