/** @format */

//#region Imports NPM
import React, { ChangeEvent, FC } from 'react';
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
  FormControl,
  InputLabel,
  TextField,
} from '@material-ui/core';
import { useRouter } from 'next/router';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import EditIcon from '@material-ui/icons/Edit';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import DateFnsUtils from '@date-io/date-fns';
import { ru as ruLocale, enUS as enLocale } from 'date-fns/locale';
import { DatePicker, LocalizationProvider } from '@material-ui/pickers';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { Gender, Profile, ProfileInput, ProfileEditComponentProps, Contact } from '@lib/types';
import IsAdmin from '@front/components/isAdmin';
import Avatar from '@front/components/ui/avatar';
import Loading from '@front/components/loading';
import Button from '@front/components/ui/button';
import { DropzoneWrapper } from '@front/components/dropzone';
import ProfileTextFieldComponent from './text-field';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    control: {
      backgroundColor: fade(theme.palette.secondary.main, 0.05),
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
      marginTop: theme.spacing() / 4,
    },
    controlLeft: {
      'padding': 4,
      'color': theme.palette.secondary.main,
      'opacity': 0.6,
      'transition': `all 200ms ${theme.transitions.easing.easeOut} 0ms`,
      '&:hover': {
        opacity: 1,
        color: '#fff',
        backgroundColor: theme.palette.secondary.main,
      },
      'marginLeft': theme.spacing(),
    },
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
    loading: {
      zIndex: 1,
    },
  }),
);

const endAdornment = (
  <InputAdornment position="end">
    <EditIcon color="secondary" />
  </InputAdornment>
);

const names: (keyof ProfileInput)[] = ['lastName', 'firstName', 'middleName'];
const companyes: (keyof ProfileInput)[] = ['company', 'management', 'department', 'division', 'title'];
const langs: (keyof ProfileInput)[] = ['companyEng', 'managementEng', 'departmentEng', 'divisionEng', 'positionEng'];
const others: (keyof ProfileInput)[] = [
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
  newProfile = false,
  loadingCheckUsername,
  loadingProfile,
  loadingChanged,
  hasUpdate,
  profile,
  onDrop,
  handleCheckUsername,
  handleChange,
  handleBirthday,
  handleSave,
  locale,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();
  const router = useRouter();
  const InputProps = isAdmin ? { endAdornment } : { readOnly: true };
  const dateLocale = locale === 'en' ? enLocale : ruLocale;

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" p={1} className={classes.control}>
        <IconButton className={classes.controlLeft} onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <div style={{ width: '100%' }} />
        <IsAdmin>
          <Box flex={1} display="flex" alignItems="center" justifyContent="flex-end">
            <Button style={{ marginRight: '10px' }} size="small" disabled={!hasUpdate} onClick={handleSave}>
              {newProfile ? t('common:save') : t('common:accept')}
            </Button>
          </Box>
        </IsAdmin>
      </Box>
      <Box display="flex" flexDirection="column" p={2} overflow="auto">
        <Loading
          wrapperClasses={classes.loading}
          activate={loadingProfile}
          full
          absolute
          type="circular"
          color="secondary"
          disableShrink
          size={48}
        >
          <Box display="flex" position="relative" flexDirection="column">
            {profile ? (
              <>
                <Loading
                  wrapperClasses={classes.loading}
                  activate={loadingChanged}
                  full
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
                            onChange={(event) => handleChange('contact')((event as unknown) as ChangeEvent<HTMLUnknownElement>)}
                            color="secondary"
                            value={profile.contact}
                            label={t('phonebook:contact.title')}
                          >
                            <MenuItem value="USER">{t('phonebook:contact.user')}</MenuItem>
                            <MenuItem value="PROFILE">{t('phonebook:contact.profile')}</MenuItem>
                          </Select>
                        </FormControl>
                        {newProfile && profile.contact === Contact.USER && (
                          <>
                            <ProfileTextFieldComponent
                              disabled={loadingCheckUsername || false}
                              handleChange={handleChange}
                              field="username"
                              value={profile.username}
                              InputProps={newProfile ? InputProps : { readOnly: true }}
                              fullWidth={false}
                            />
                            <Button onClick={handleCheckUsername}>{t('common:check')}</Button>
                          </>
                        )}
                        {!newProfile && profile.contact === Contact.USER && (
                          <ProfileTextFieldComponent
                            disabled
                            handleChange={handleChange}
                            field="username"
                            value={profile.username}
                            InputProps={newProfile ? InputProps : { readOnly: true }}
                            fullWidth={false}
                          />
                        )}
                      </div>
                      <div className={classes.topRightBlock}>
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
                        {typeof profile.notShowing === 'boolean' && (
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
                        )}
                        {typeof profile.disabled === 'boolean' && (
                          <FormControlLabel
                            control={
                              <Checkbox
                                disabled
                                checked={profile.disabled}
                                onChange={handleChange('disabled')}
                                color="secondary"
                                value="disabled"
                              />
                            }
                            label={t('phonebook:fields.disabled')}
                          />
                        )}
                      </div>
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
                    <LocalizationProvider dateAdapter={DateFnsUtils} locale={dateLocale}>
                      <DatePicker
                        renderInput={(props) => <TextField fullWidth variant="outlined" color="secondary" {...props} />}
                        disabled={loadingChanged}
                        disableFuture
                        label={t('phonebook:fields.birthday')}
                        value={profile.birthday}
                        onChange={handleBirthday}
                      />
                    </LocalizationProvider>
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
