/** @format */

// #region Imports NPM
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useLazyQuery } from '@apollo/react-hooks';
import { Theme, makeStyles, createStyles, withStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import { Box, Card, CardContent, Paper, List, ListItem, ListItemText, IconButton } from '@material-ui/core';
import { ArrowBackRounded, PhoneRounded, PhoneAndroidRounded } from '@material-ui/icons';
import { red } from '@material-ui/core/colors';
// #endregion
// #region Imports Local
import { Profile } from '@app/portal/profile/models/profile.dto';
import PhonebookProfileControl from './control';
import { nextI18next } from '../../../lib/i18n-client';
import { ProfileProps, PhonebookProfileModule, PhonebookProfileNameProps, PhonebookProfileFieldProps } from '../types';
import Avatar from '../../ui/avatar';
import { PROFILE } from '../../../lib/queries';
import IsAdmin from '../../isAdmin';
import { ComposeLink } from '../../compose-link';
import snackbarUtils from '../../../lib/snackbar-utils';
// #endregion

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
      gap: `${theme.spacing(2)}px`,
      padding: theme.spacing(0.5),
    },
    main: {
      [theme.breakpoints.up('sm')]: {
        gridTemplateColumns: 'auto minmax(auto, 420px)',
      },
    },
    list: {
      'color': '#747474',
      'padding': 0,

      '& > li': {
        minHeight: '48px',
        padding: '4px 16px',
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
  },
}))(({ classes, profile, type }: PhonebookProfileNameProps) => (
  <h2 className={classes.root}>{profile ? profile[type] : <Skeleton variant="rect" width={120} />}</h2>
));

const ProfileField = withStyles((theme) => ({
  root: {
    'display': 'grid',
    'gap': `${theme.spacing()}px`,
    'gridTemplateColumns': '120px auto',

    '& > .MuiListItemText-root': {
      margin: 0,
      display: 'flex',
      alignItems: 'center',
    },
  },
  pointer: {
    cursor: 'pointer',
  },
}))(({ classes, profile, last, onClick, title, field }: PhonebookProfileFieldProps) => (
  <ListItem divider={!last}>
    <div className={classes.root}>
      <ListItemText primary={title} />
      <ListItemText
        className={(onClick && profile?.[field] && classes.pointer) || ''}
        onClick={onClick && onClick(profile?.[field])}
        primary={
          profile ? (
            field !== 'manager' ? (
              profile[field]
            ) : profile.manager ? (
              profile.manager.fullName
            ) : (
              ''
            )
          ) : (
            <Skeleton variant="rect" width={250} height={25} />
          )
        }
      />
    </div>
  </ListItem>
));

const ProfileComponent = React.forwardRef<React.Component, ProfileProps>(
  ({ t, profileId, handleClose, handleSearch }, ref) => {
    const classes = useStyles({});

    const [controlEl, setControlEl] = useState<HTMLElement | null>(null);

    const [getProfile, { loading, error, data }] = useLazyQuery(PROFILE);

    useEffect(() => {
      getProfile({
        variables: { id: profileId },
      });
    }, [getProfile, profileId]);

    const handleProfile = (profile: Profile) => (): void => {
      if (!profile.disabled && !profile.notShowing) {
        getProfile({
          variables: {
            id: profile.id,
          },
        });
      }
    };

    const handleSearchClose = (text: string | undefined) => (): void => {
      if (!text) return;

      handleSearch(text);
      handleClose();
    };

    const handleControl = (event: React.MouseEvent<HTMLElement>): void => {
      setControlEl(event.currentTarget);
    };

    const handleCloseControl = (): void => {
      setControlEl(null);
    };

    const profile = !loading && !error && data?.profile;

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
              gridTemplateRows="max-content"
              className={clsx(classes.grid, {
                [classes.fullRow]: error,
              })}
            >
              <Box justifyContent="space-between" display="flex">
                <IconButton className={classes.noPadding} onClick={handleClose}>
                  <ArrowBackRounded />
                </IconButton>
                <IsAdmin>
                  <PhonebookProfileControl
                    controlEl={controlEl}
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
                    <span>{t(`phonebook:fields.disabled`)}</span>
                  </Box>
                )}
                {profile?.notShowing && (
                  <Box display="flex" alignItems="center" justifyContent="center" className={classes.notShowing}>
                    <span>{t(`phonebook:fields.notShowing`)}</span>
                  </Box>
                )}
                {profile?.nameeng && (
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <span>{profile.nameeng}</span>
                  </Box>
                )}
                {profile?.mobile && (
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <PhoneAndroidRounded />
                    <span>{profile.mobile}</span>
                  </Box>
                )}
                {profile?.workPhone && (
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <PhoneRounded />
                    <span>{profile.workPhone}</span>
                  </Box>
                )}
                {profile?.email && (
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <ComposeLink to={profile.email}>{profile.email}</ComposeLink>
                  </Box>
                )}
              </>
            </Box>
            {!error && (
              <Box gridTemplateRows="max-content" className={classes.grid}>
                <Paper>
                  <List className={classes.list}>
                    <ProfileField
                      title={t(`phonebook:fields.company`)}
                      profile={profile}
                      field="company"
                      onClick={handleSearchClose}
                    />
                    <ProfileField
                      title={t(`phonebook:fields.department`)}
                      profile={profile}
                      field="department"
                      onClick={handleSearchClose}
                    />
                    <ProfileField
                      title={t(`phonebook:fields.title`)}
                      profile={profile}
                      field="title"
                      onClick={handleSearchClose}
                    />
                    <ProfileField
                      title={t(`phonebook:fields.otdel`)}
                      profile={profile}
                      field="otdel"
                      onClick={handleSearchClose}
                    />
                    <ProfileField
                      last
                      title={t(`phonebook:fields.manager`)}
                      profile={profile}
                      field="manager"
                      onClick={handleProfile}
                    />
                  </List>
                </Paper>
                <Paper>
                  <List className={classes.list}>
                    <ProfileField title={t(`phonebook:fields.country`)} profile={profile} field="country" />
                    <ProfileField title={t(`phonebook:fields.region`)} profile={profile} field="region" />
                    <ProfileField title={t(`phonebook:fields.town`)} profile={profile} field="town" />
                    <ProfileField title={t(`phonebook:fields.street`)} profile={profile} field="street" />
                    <ProfileField last title={t(`phonebook:fields.postalCode`)} profile={profile} field="postalCode" />
                  </List>
                </Paper>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  },
);

export default nextI18next.withTranslation('phonebook')(ProfileComponent);
