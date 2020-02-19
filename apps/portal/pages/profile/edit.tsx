/** @format */

// #region Imports NPM
import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { Request } from 'express';
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
} from '@material-ui/core';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import EditIcon from '@material-ui/icons/Edit';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
// #endregion
// #region Imports Local
import IsAdmin from '../../components/isAdmin';
import { Profile } from '../../src/profile/models/profile.dto';
import Page from '../../layouts/main';
import Avatar from '../../components/ui/avatar';
import { Loading } from '../../components/loading';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { PROFILE, CHANGE_PROFILE } from '../../lib/queries';
import { resizeImage } from '../../lib/utils';
import Button from '../../components/ui/button';
import { Gender } from '../../src/shared/interfaces';
import { format } from '../../lib/dayjs';
import snackbarUtils from '../../lib/snackbar-utils';
import { DropzoneWrapper } from '../../components/dropzone';
import { User } from '../../src/user/models/user.dto';
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
  }),
);

interface ProfileEditProps {
  user?: User;
  isAdmin: boolean;
}

const ProfileEditPage: I18nPage<ProfileEditProps> = ({ t, user, isAdmin, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const [getProfile, { loading, error, data }] = useLazyQuery(PROFILE, { ssr: false });
  const [current, setCurrent] = useState<Profile | undefined>();
  const [updated, setUpdated] = useState<Profile | undefined>();
  const router = useRouter();

  const [changeProfile, { loading: loadingProfile, error: errorProfile }] = useMutation(CHANGE_PROFILE);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length) {
        const thumbnailPhoto = (await resizeImage(acceptedFiles[0])) as string;
        setCurrent({ ...current, thumbnailPhoto });
        setUpdated({ ...updated, thumbnailPhoto });
      }
    },
    [current, updated],
  );

  // TODO: пока так, потом переделать с выводом ошибок
  useEffect(() => {
    if (isAdmin && router?.query?.id) {
      const id = router.query.id as string;
      getProfile({
        variables: { id },
      });
      setUpdated({ id } as any);
    } else {
      setCurrent(user.profile);
    }
  }, [getProfile, isAdmin, router, user.profile]);

  useEffect(() => {
    if (isAdmin && !loading && !error && data?.profile) {
      setCurrent(data.profile);
    }
  }, [loading, data, error, isAdmin]);

  const handleChange = (name: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const el: EventTarget & HTMLInputElement = e.target;
    const value: string | boolean | number = el.type === 'checkbox' ? el.checked : el.value;

    if (isAdmin) {
      const result = name === 'gender' ? +value : value;

      setCurrent({ ...current, [name]: result });
      setUpdated({ ...updated, [name]: result });
    }
  };

  const handleBirthday = (value: Date | null): void => {
    setCurrent({ ...current, birthday: new Date(value) });
    setUpdated({ ...updated, birthday: new Date(format(value, 'YYYY-MM-DD')) });
  };

  const handleSave = (): void => {
    changeProfile({
      variables: {
        profile: updated,
        thumbnailPhoto: updated.thumbnailPhoto,
      },
    });
  };

  const endAdornment = (
    <InputAdornment position="end">
      <EditIcon color="secondary" />
    </InputAdornment>
  );

  const InputProps = isAdmin ? { endAdornment } : { readOnly: true };

  useEffect(() => {
    if (error) {
      snackbarUtils.error(error);
    }
    if (errorProfile) {
      snackbarUtils.error(errorProfile);
    }
  }, [error, errorProfile]);

  return (
    <>
      <Head>
        <title>{t('profile:edit.title', { current })}</title>
      </Head>
      <Page {...rest}>
        <Box display="flex" flexDirection="column">
          <Loading activate={!current} noMargin type="linear" variant="indeterminate" />
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
              <Loading activate={loading} noMargin type="linear" variant="indeterminate">
                {current && (
                  <>
                    <Loading activate={loadingProfile} full absolute color="secondary" size={48} type="circular" />
                    <div className={classes.firstBlock}>
                      <Box display="flex">
                        <Box mr={1} position="relative">
                          <DropzoneWrapper onDrop={onDrop}>
                            <IconButton className={classes.pickPhoto}>
                              <PhotoCameraIcon />
                            </IconButton>
                            <Avatar fullSize className={classes.avatar} profile={current} alt="photo" />
                          </DropzoneWrapper>
                        </Box>
                        <div className={classes.nameBlock}>
                          <TextField
                            fullWidth
                            disabled={loadingProfile}
                            onChange={handleChange('lastName')}
                            color="secondary"
                            value={current.lastName || ''}
                            label={t('phonebook:fields.lastName')}
                            variant="outlined"
                            InputProps={InputProps}
                          />
                          <TextField
                            fullWidth
                            disabled={loadingProfile}
                            onChange={handleChange('firstName')}
                            color="secondary"
                            value={current.firstName || ''}
                            label={t('phonebook:fields.firstName')}
                            variant="outlined"
                            InputProps={InputProps}
                          />
                          <TextField
                            fullWidth
                            disabled={loadingProfile}
                            onChange={handleChange('middleName')}
                            color="secondary"
                            value={current.middleName || ''}
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
                                  disabled={loadingProfile}
                                  checked={current.notShowing}
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
                              value={current.gender}
                            >
                              <FormControlLabel
                                disabled={loadingProfile}
                                value={Gender.MAN}
                                control={<Radio color="secondary" />}
                                label={t('common:gender.MAN')}
                                name="gender"
                                labelPlacement="end"
                              />
                              <FormControlLabel
                                disabled={loadingProfile}
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
                            disabled={loadingProfile}
                            onChange={handleChange('nameeng')}
                            color="secondary"
                            value={current.nameeng || ''}
                            label={t('phonebook:fields.nameeng')}
                            variant="outlined"
                            InputProps={InputProps}
                          />
                        </div>
                      </div>
                      <div className={classes.nameBlock}>
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('company')}
                          color="secondary"
                          value={current.company || ''}
                          label={t('phonebook:fields.company')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('department')}
                          color="secondary"
                          value={current.department || ''}
                          label={t('phonebook:fields.department')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('otdel')}
                          color="secondary"
                          value={current.otdel || ''}
                          label={t('phonebook:fields.otdel')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('title')}
                          color="secondary"
                          value={current.title || ''}
                          label={t('phonebook:fields.title')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                      </div>
                      <div className={classes.nameBlock}>
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('companyeng')}
                          color="secondary"
                          value={current.companyeng || ''}
                          label={t('phonebook:fields.companyeng')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('departmenteng')}
                          color="secondary"
                          value={current.departmenteng || ''}
                          label={t('phonebook:fields.departmenteng')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('otdeleng')}
                          color="secondary"
                          value={current.otdeleng || ''}
                          label={t('phonebook:fields.otdeleng')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('positioneng')}
                          color="secondary"
                          value={current.positioneng || ''}
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
                          disabled={loadingProfile}
                          onChange={handleChange('manager')}
                          color="secondary"
                          value={current.manager?.fullName}
                          label={t('phonebook:fields.manager')}
                          variant="outlined"
                          InputProps={{ readOnly: true }}
                        />
                      </div>
                      <div>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            fullWidth
                            disabled={loadingProfile}
                            inputVariant="outlined"
                            color="secondary"
                            format="yyyy-MM-dd"
                            label={t('phonebook:fields.birthday')}
                            value={current.birthday}
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
                          disabled={loadingProfile}
                          onChange={handleChange('email')}
                          color="secondary"
                          value={current.email || ''}
                          label={t('phonebook:fields.email')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                      </div>
                      <div>
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('telephone')}
                          color="secondary"
                          value={current.telephone || ''}
                          label={t('phonebook:fields.telephone')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                      </div>
                      <div>
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('mobile')}
                          color="secondary"
                          value={current.mobile || ''}
                          label={t('phonebook:fields.mobile')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                      </div>
                      <div>
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('workPhone')}
                          color="secondary"
                          value={current.workPhone || ''}
                          label={t('phonebook:fields.workPhone')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                      </div>
                      <div>
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('country')}
                          color="secondary"
                          value={current.country || ''}
                          label={t('phonebook:fields.country')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                      </div>
                      <div>
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('region')}
                          color="secondary"
                          value={current.region || ''}
                          label={t('phonebook:fields.region')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                      </div>
                      <div>
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('town')}
                          color="secondary"
                          value={current.town || ''}
                          label={t('phonebook:fields.town')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                      </div>
                      <div>
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('street')}
                          color="secondary"
                          value={current.street || ''}
                          label={t('phonebook:fields.street')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                      </div>
                      <div>
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('postalCode')}
                          color="secondary"
                          value={current.postalCode || ''}
                          label={t('phonebook:fields.postalCode')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                      </div>
                      <div>
                        <TextField
                          fullWidth
                          disabled={loadingProfile}
                          onChange={handleChange('employeeID')}
                          color="secondary"
                          value={current.employeeID || ''}
                          label={t('phonebook:fields.employeeID')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                      </div>
                    </div>
                  </>
                )}
              </Loading>
            </Box>
          </Box>
        </Box>
      </Page>
    </>
  );
};

ProfileEditPage.getInitialProps = ({ req }) => {
  const { user }: { user?: User } = ((req as unknown) as Request)?.session?.passport.user;

  return {
    user,
    isAdmin: user?.isAdmin || false,
    namespacesRequired: includeDefaultNamespaces(['profile', 'phonebook']),
  };
};

export default nextI18next.withTranslation('profile')(ProfileEditPage);
