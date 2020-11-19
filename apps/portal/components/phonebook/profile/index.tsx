/** @format */

//#region Imports NPM
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { useLazyQuery } from '@apollo/client';
import { Theme, makeStyles, createStyles, withStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import { Box, Card, CardContent, Paper, List, ListItem, ListItemText, IconButton, Typography } from '@material-ui/core';
import { ArrowBackRounded, PhoneRounded, PhoneAndroidRounded, PersonRounded, CallEndRounded } from '@material-ui/icons';
import { red } from '@material-ui/core/colors';
//#endregion
//#region Imports Local
import { nextI18next } from '@lib/i18n-client';
import { Data, Profile, ProfileProps, PhonebookProfileModule, PhonebookProfileNameProps, PhonebookProfileFieldProps } from '@lib/types';
import { PROFILE } from '@lib/queries';
import snackbarUtils from '@lib/snackbar-utils';
import Avatar from '@front/components/ui/avatar';
import IsAdmin from '@front/components/isAdmin';
import { ComposeLink } from '@front/components/compose-link';
import CopyButton from '@front/components/ui/copy-button';
import PhonebookProfileControl from './control';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: '#F7FBFA',
      padding: '24px 21px',
      width: 'max-content',
      maxWidth: '95vw',
    },
    noPadding: {
      padding: 0,
    },
    fullRow: {
      gridColumnStart: 1,
      gridColumnEnd: 3,
    },
    wrap: {
      '&:last-child': {
        padding: 0,
        maxHeight: '90vh',
        overflow: 'auto',
      },
    },
    grid: {
      display: 'grid',
      gap: `${theme.spacing()}px`,
      padding: theme.spacing(0.5),
    },
    gridFull: {
      gridTemplateRows: 'max-content',
    },
    main: {
      [theme.breakpoints.up('sm')]: {
        gridTemplateColumns: 'auto minmax(auto, 420px)',
      },
    },
    list: {
      // 'color': '#747474',
      'padding': 0,

      '& > li': {
        minHeight: 48,
        padding: theme.spacing(0.5, 0.5, 0.5, 2),
      },
    },
    username: {
      color: '#6AA7C8',
    },
    email: {
      'color': '#31312F',
      '&:hover': {
        textDecoration: 'none',
      },
    },
    telephone: {
      'marginLeft': -32,
      '& > svg': {
        marginRight: theme.spacing(),
      },
    },
    disabled: {
      color: red[600],
    },
    notShowing: {
      color: red[600],
    },
  }),
);

const ProfileAvatar = withStyles({
  avatar: {
    height: '180px',
    width: '180px',
  },
})(({ classes, profile }: PhonebookProfileModule<'avatar'>) => (
  <Box display="flex" alignItems="center" justifyContent="center">
    {profile ? (
      <Avatar fullSize className={classes.avatar} profile={profile} alt="photo" />
    ) : (
      <Skeleton className={classes.avatar} variant="circle" />
    )}
  </Box>
));

const ProfileName = withStyles((theme) => ({
  root: {
    margin: theme.spacing(0.5),
    fontWeight: 500,
    maxWidth: 300,
    textAlign: 'center',
  },
}))(({ classes, profile, type }: PhonebookProfileNameProps) => (
  <h2 className={classes.root}>{profile ? profile[type] : <Skeleton variant="rect" width={120} />}</h2>
));

const ProfileField = withStyles((theme) => ({
  root: {
    'display': 'grid',
    'gap': `${theme.spacing()}px`,
    'gridTemplateColumns': '120px 1fr 30px',
    'width': '100%',

    '& > .MuiListItemText-root': {
      margin: 0,
      display: 'flex',
      alignItems: 'center',
    },
  },
  pointer: {
    cursor: 'pointer',
  },
}))(({ classes, profile, last, onClick, title, field }: PhonebookProfileFieldProps) => {
  const text =
    typeof profile === 'object' && profile !== null ? (field !== 'manager' ? profile[field] || '' : profile.manager?.fullName || '') : '';
  const thisField = profile?.[field];

  return (
    <ListItem divider={!last}>
      <div className={classes.root}>
        <ListItemText primary={title} />
        <ListItemText
          className={clsx({
            [classes.pointer]: onClick && text,
          })}
          primary={
            profile ? (
              <Typography onClick={onClick && typeof thisField !== 'undefined' && thisField !== null ? onClick(thisField) : undefined}>
                {text}
              </Typography>
            ) : (
              <Skeleton variant="rect" width={250} height={25} />
            )
          }
        />
        {profile && text && <CopyButton text={text} />}
      </div>
    </ListItem>
  );
});

const PhonebookProfile = React.forwardRef<React.Component, ProfileProps>(({ t, profileId, handleClose, handleSearch }, ref) => {
  const classes = useStyles({});

  const [profile, setProfile] = useState<Profile | undefined>();
  const [controlElement, setControlElement] = useState<HTMLElement | null>(null);

  const [getProfile, { loading, error, data }] = useLazyQuery<Data<'profile', Profile>, { id: string }>(PROFILE, {
    ssr: false,
  });

  useEffect(() => {
    getProfile({
      variables: { id: profileId },
    });
  }, [getProfile, profileId]);

  useEffect(() => {
    if (!loading && !error && data) {
      setProfile(data.profile);
    }
  }, [setProfile, data, loading, error]);

  const handleProfile = (prof: string | Profile) => (): void => {
    if (typeof prof === 'object' && prof !== null && !prof.disabled && !prof.notShowing && prof.id) {
      getProfile({
        variables: {
          id: prof.id,
        },
      });
    }
  };

  const handleSearchClose = (text: string | Profile) => (): void => {
    handleSearch(typeof text === 'string' ? text : text.fullName || '');
    handleClose();
  };

  const handleControl = (event: React.MouseEvent<HTMLElement>): void => {
    setControlElement(event.currentTarget);
  };

  const handleCloseControl = (): void => {
    setControlElement(null);
  };

  useEffect(() => {
    if (error) {
      snackbarUtils.error(error);
    }
  }, [error]);

  return (
    <Card ref={ref} className={classes.root}>
      <CardContent className={clsx(classes.wrap, classes.noPadding)}>
        <Box className={clsx(classes.grid, classes.main)}>
          <Box
            className={clsx(classes.grid, classes.gridFull, {
              [classes.fullRow]: error,
            })}
          >
            <Box justifyContent="space-between" display="flex">
              <Link href={{ pathname: '/phonebook' }} as="/phonebook">
                <IconButton size="small">
                  <ArrowBackRounded />
                </IconButton>
              </Link>
              <IsAdmin>
                <PhonebookProfileControl
                  controlEl={controlElement}
                  profileId={profile?.id}
                  handleControl={handleControl}
                  handleCloseControl={handleCloseControl}
                />
              </IsAdmin>
            </Box>
            <>
              <ProfileAvatar profile={profile} />
              <Box display="flex" flexDirection="column" alignItems="center">
                <ProfileName profile={profile} type="lastName" />
                <ProfileName profile={profile} type="firstName" />
                <ProfileName profile={profile} type="middleName" />
              </Box>
              {profile?.disabled && (
                <Box display="flex" alignItems="center" justifyContent="center" className={classes.disabled}>
                  <span>{t('phonebook:fields.disabled')}</span>
                </Box>
              )}
              {profile?.notShowing && (
                <Box display="flex" alignItems="center" justifyContent="center" className={classes.notShowing}>
                  <span>{t('phonebook:fields.notShowing')}</span>
                </Box>
              )}
              {profile?.nameEng && (
                <Box display="flex" alignItems="center" justifyContent="center">
                  <span>{profile.nameEng}</span>
                </Box>
              )}
              {profile?.mobile && (
                <Box display="flex" alignItems="center" justifyContent="center" className={classes.telephone}>
                  <PhoneAndroidRounded />
                  <span>{profile.mobile}</span>
                </Box>
              )}
              {profile?.telephone && (
                <Box display="flex" alignItems="center" justifyContent="center" className={classes.telephone}>
                  <CallEndRounded />
                  <span>{profile.telephone}</span>
                </Box>
              )}
              {profile?.workPhone && (
                <Box display="flex" alignItems="center" justifyContent="center" className={classes.telephone}>
                  <PhoneRounded />
                  <span>{profile.workPhone}</span>
                </Box>
              )}
              {profile?.loginDomain && (
                <Box display="flex" alignItems="center" justifyContent="center" className={classes.telephone}>
                  <PersonRounded className={classes.username} />
                  <span>{profile.loginDomain}</span>
                </Box>
              )}
              {profile?.username && (
                <Box display="flex" alignItems="center" justifyContent="center" className={classes.telephone}>
                  <PersonRounded className={classes.username} />
                  <span>{profile.username}</span>
                </Box>
              )}
              {profile?.email && (
                <Box display="flex" alignItems="center" justifyContent="center">
                  <ComposeLink className={classes.email} to={profile.email}>
                    {profile.email}
                  </ComposeLink>
                  <CopyButton style={{ marginLeft: '8px' }} text={profile.email} />
                </Box>
              )}
            </>
          </Box>
          {!error && profile && (
            <Box className={clsx(classes.grid, classes.gridFull)}>
              <Paper>
                <List className={classes.list}>
                  <ProfileField title={t('phonebook:fields.company')} profile={profile} field="company" onClick={handleSearchClose} />
                  <ProfileField title={t('phonebook:fields.management')} profile={profile} field="management" onClick={handleSearchClose} />
                  <ProfileField title={t('phonebook:fields.department')} profile={profile} field="department" onClick={handleSearchClose} />
                  <ProfileField title={t('phonebook:fields.division')} profile={profile} field="division" onClick={handleSearchClose} />
                  <ProfileField title={t('phonebook:fields.title')} profile={profile} field="title" onClick={handleSearchClose} />
                  <ProfileField last title={t('phonebook:fields.manager')} profile={profile} field="manager" onClick={handleProfile} />
                </List>
              </Paper>
              <Paper>
                <List className={classes.list}>
                  <ProfileField title={t('phonebook:fields.country')} profile={profile} field="country" />
                  <ProfileField title={t('phonebook:fields.region')} profile={profile} field="region" />
                  <ProfileField title={t('phonebook:fields.town')} profile={profile} field="town" />
                  <ProfileField title={t('phonebook:fields.street')} profile={profile} field="street" />
                  <ProfileField last title={t('phonebook:fields.room')} profile={profile} field="room" />
                </List>
              </Paper>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

export default nextI18next.withTranslation('phonebook')(PhonebookProfile);
