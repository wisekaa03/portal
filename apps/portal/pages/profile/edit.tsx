/** @format */

// #region Imports NPM
import React, { useContext, useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
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
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import EditIcon from '@material-ui/icons/Edit';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
// #endregion
// #region Imports Local
import IsAdmin from '../../components/isAdmin';
import { Profile } from '../../src/profile/models/profile.dto';
import Page from '../../layouts/main';
import { Avatar } from '../../components/avatar';
import { Loading } from '../../components/loading';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { ProfileContext } from '../../lib/context';
import { PROFILE, CHANGE_PROFILE } from '../../lib/queries';
import { toBase64 } from '../../components/utils';
import Button from '../../components/button';
import { Gender } from '../../src/shared/interfaces';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    firstBlock: {
      display: 'grid',
      gridGap: theme.spacing(2),
      width: '100%',
      [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: '1fr 1fr',
      },
    },
    secondBlock: {
      display: 'grid',
      gridGap: theme.spacing(2),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        gridTemplateColumns: '1fr 1fr',
      },
      [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
      },
    },
    avatar: {
      height: 200,
      width: 200,
      borderRadius: theme.spacing() / 2,
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
        marginBottom: theme.spacing(),
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
      'width': '100%',
      'height': '100%',
      'borderRadius': theme.spacing() / 2,
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

const ProfileEdit: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const [getProfile, { loading, error, data }] = useLazyQuery(PROFILE);
  const [current, setCurrent] = useState<Profile | undefined>();
  const [updated, setUpdated] = useState<Profile | undefined>();
  const profile = useContext(ProfileContext);
  const isAdmin = profile && profile.user && profile.user.isAdmin;
  const router = useRouter();

  const [changeProfile] = useMutation(CHANGE_PROFILE);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length) {
        const thumbnailPhoto = (await toBase64(acceptedFiles[0])) as string;
        setCurrent({ ...current, thumbnailPhoto });
        setUpdated({ ...updated, thumbnailPhoto });
      }
    },
    [current, updated],
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // TODO: пока так, потом переделать с выводом ошибок
  useEffect(() => {
    if (isAdmin && router && router.query && router.query.id) {
      const id = router.query.id as string;
      getProfile({
        variables: { id },
      });
      setUpdated({ id } as any);
    } else {
      setCurrent(profile.user.profile);
    }
  }, [isAdmin, getProfile, router, profile.user]);

  useEffect(() => {
    if (isAdmin && !loading) {
      if (!error && data && data.profile) {
        setCurrent(data.profile);
      } else {
        setCurrent(profile.user.profile);
      }
    }
  }, [loading, data, isAdmin, error, profile.user.profile]);

  const handleChange = (name: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const el: EventTarget & HTMLInputElement = e.target;
    const value: string | boolean = el.type === 'checkbox' ? el.checked : el.value;

    if (isAdmin) {
      const result = name === 'gender' ? +value : value;

      setCurrent({ ...current, [name]: result });
      setUpdated({ ...updated, [name]: result });
    }
  };

  const handleSave = (): void => {
    changeProfile({
      variables: {
        profile: updated,
      },
    });
  };

  const endAdornment = (
    <InputAdornment position="end">
      <EditIcon color="secondary" />
    </InputAdornment>
  );

  const InputProps = isAdmin ? { endAdornment } : { readOnly: true };

  const getManager = (m: Profile | undefined): string =>
    // eslint-disable-next-line prettier/prettier
    (m ? `${m.lastName || ''} ${m.firstName || ''} ${m.middleName || ''}` : '');

  return (
    <>
      <Head>
        <title>{t('profile:title')}</title>
      </Head>
      <Page {...rest}>
        <Box display="flex" flexDirection="column">
          {!current && <Loading noMargin type="linear" variant="indeterminate" />}
          <Box display="flex" flexDirection="column" p={2} overflow="auto">
            <Box display="flex" mb={1}>
              <Link href={{ pathname: '/profile' }} passHref>
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
              {current && (
                <>
                  <div className={classes.firstBlock}>
                    <Box display="flex">
                      <Box mr={1} position="relative">
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <IconButton className={classes.pickPhoto}>
                            <PhotoCameraIcon />
                          </IconButton>
                          <Avatar fullSize className={classes.avatar} profile={current} />
                        </div>
                      </Box>
                      <div className={classes.nameBlock}>
                        <TextField
                          fullWidth
                          onChange={handleChange('lastName')}
                          color="secondary"
                          value={current.lastName || ''}
                          label={t('phonebook:fields.lastName')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                        <TextField
                          fullWidth
                          onChange={handleChange('firstName')}
                          color="secondary"
                          value={current.firstName || ''}
                          label={t('phonebook:fields.firstName')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                        <TextField
                          fullWidth
                          onChange={handleChange('middleName')}
                          color="secondary"
                          value={current.middleName || ''}
                          label={t('phonebook:fields.middleName')}
                          variant="outlined"
                          InputProps={InputProps}
                        />
                      </div>
                    </Box>
                    <div className={classes.nameBlock}>
                      <TextField
                        fullWidth
                        onChange={handleChange('nameEng')}
                        color="secondary"
                        value={current.nameEng || ''}
                        label={t('phonebook:fields.nameEng')}
                        variant="outlined"
                        InputProps={InputProps}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={current.notShowing}
                            onChange={handleChange('notShowing')}
                            color="secondary"
                            value="notShowing"
                          />
                        }
                        label={t('phonebook:fields.notShowing')}
                      />
                      <RadioGroup
                        className={classes.genderBlock}
                        onChange={handleChange('gender')}
                        aria-label="gender"
                        name="gender"
                        value={current.gender}
                      >
                        <FormControlLabel
                          value={Gender.MAN}
                          control={<Radio color="secondary" />}
                          label={t('common:gender.MAN')}
                          name="gender"
                          labelPlacement="end"
                        />
                        <FormControlLabel
                          value={Gender.WOMAN}
                          control={<Radio color="secondary" />}
                          label={t('common:gender.WOMAN')}
                          name="gender"
                          labelPlacement="end"
                        />
                        <FormControlLabel
                          value={Gender.UNKNOWN}
                          control={<Radio color="secondary" />}
                          label={t('common:gender.UNKNOWN')}
                          name="gender"
                          labelPlacement="end"
                        />
                      </RadioGroup>
                    </div>
                    <div>
                      <TextField
                        fullWidth
                        onChange={handleChange('company')}
                        color="secondary"
                        value={current.company || ''}
                        label={t('phonebook:fields.company')}
                        variant="outlined"
                        InputProps={InputProps}
                      />
                    </div>
                    <div>
                      <TextField
                        fullWidth
                        onChange={handleChange('companyEng')}
                        color="secondary"
                        value={current.companyEng || ''}
                        label={t('phonebook:fields.companyEng')}
                        variant="outlined"
                        InputProps={InputProps}
                      />
                    </div>
                    <div>
                      <TextField
                        fullWidth
                        onChange={handleChange('department')}
                        color="secondary"
                        value={current.department || ''}
                        label={t('phonebook:fields.department')}
                        variant="outlined"
                        InputProps={InputProps}
                      />
                    </div>
                    <div>
                      <TextField
                        fullWidth
                        onChange={handleChange('departmentEng')}
                        color="secondary"
                        value={current.departmentEng || ''}
                        label={t('phonebook:fields.departmentEng')}
                        variant="outlined"
                        InputProps={InputProps}
                      />
                    </div>
                    <div>
                      <TextField
                        fullWidth
                        onChange={handleChange('otdel')}
                        color="secondary"
                        value={current.otdel || ''}
                        label={t('phonebook:fields.otdel')}
                        variant="outlined"
                        InputProps={InputProps}
                      />
                    </div>
                    <div>
                      <TextField
                        fullWidth
                        onChange={handleChange('otdelEng')}
                        color="secondary"
                        value={current.otdelEng || ''}
                        label={t('phonebook:fields.otdelEng')}
                        variant="outlined"
                        InputProps={InputProps}
                      />
                    </div>
                    <div>
                      <TextField
                        fullWidth
                        onChange={handleChange('title')}
                        color="secondary"
                        value={current.title || ''}
                        label={t('phonebook:fields.title')}
                        variant="outlined"
                        InputProps={InputProps}
                      />
                    </div>
                    <div>
                      <TextField
                        fullWidth
                        onChange={handleChange('positionEng')}
                        color="secondary"
                        value={current.positionEng || ''}
                        label={t('phonebook:fields.positionEng')}
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
                        onChange={handleChange('manager')}
                        color="secondary"
                        value={getManager(current.manager)}
                        label={t('phonebook:fields.manager')}
                        variant="outlined"
                        InputProps={{ readOnly: true }}
                      />
                    </div>
                    <div>
                      <TextField
                        fullWidth
                        onChange={handleChange('birthday')}
                        color="secondary"
                        value={current.birthday || ''}
                        label={t('phonebook:fields.birthday')}
                        variant="outlined"
                        InputProps={InputProps}
                      />
                    </div>
                    <div>
                      <TextField
                        fullWidth
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
                        onChange={handleChange('postalCode')}
                        color="secondary"
                        value={current.postalCode || ''}
                        label={t('phonebook:fields.postalCode')}
                        variant="outlined"
                        InputProps={InputProps}
                      />
                    </div>
                  </div>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Page>
    </>
  );
};

ProfileEdit.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['profile', 'phonebook']),
});

export default nextI18next.withTranslation('profile')(ProfileEdit);
