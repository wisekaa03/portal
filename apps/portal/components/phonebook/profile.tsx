/** @format */

// #region Imports NPM
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import {
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  ClickAwayListener,
  MenuList,
  MenuItem,
  Popper,
} from '@material-ui/core';
import { ArrowBackRounded, MoreVertRounded, PhoneRounded, PhoneAndroidRounded } from '@material-ui/icons';
import { red } from '@material-ui/core/colors';
// #endregion
// #region Imports Local
import { nextI18next } from '../../lib/i18n-client';
import { ProfileProps } from './types';
import { Avatar } from '../avatar';
import { PROFILE, CHANGE_PROFILE } from '../../lib/queries';
import IsAdmin from '../isAdmin';
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
    wrap: {
      '&:last-child': {
        padding: 0,
        maxHeight: '90vh',
        overflow: 'auto',
      },
    },
    grid: {
      display: 'grid',
      gridGap: theme.spacing(2),
      padding: theme.spacing() / 2,
    },
    main: {
      [theme.breakpoints.up('sm')]: {
        gridTemplateColumns: 'auto minmax(auto, 420px)',
      },
    },
    column: {
      gridTemplateRows: 'max-content',
    },
    center: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    list: {
      'color': '#747474',
      'padding': 0,

      '& > li': {
        minHeight: '48px',
        padding: '4px 16px',
      },
    },
    listItem: {
      'display': 'grid',
      'gridGap': theme.spacing(),
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
    topIcons: {
      justifyContent: 'space-between',
      display: 'flex',
    },
    firstName: {
      'display': 'flex',
      'flexDirection': 'column',

      'alignItems': 'center',
      '& > h2': {
        margin: theme.spacing() / 2,
        fontWeight: 500,
      },
    },
    avatar: {
      height: '180px',
      width: '180px',
    },
    disabled: {
      color: red[600],
    },
    settingsPopper: {
      zIndex: 1300,
    },
    notShowing: {
      color: red[600],
    },
  }),
);

export const BaseProfileComponent = React.forwardRef<React.Component, ProfileProps>((props, ref) => {
  const classes = useStyles({});
  const { t, profileId, handleClose, handleSearch } = props;

  if (!profileId) return null;

  const [settingsEl, setSettingsEl] = useState<HTMLElement | null>(null);

  const [getProfile, { loading, error, data }] = useLazyQuery(PROFILE);
  const [changeProfile] = useMutation(CHANGE_PROFILE);

  useEffect(() => {
    getProfile({
      variables: { id: profileId },
    });
  }, [getProfile, profileId]);

  const handleProfile = (id: string) => (): void => {
    getProfile({
      variables: { id },
    });
  };

  const handleSearchClose = (text: string | undefined) => (): void => {
    if (!text) return;

    handleSearch(text);
    handleClose();
  };

  const handleSettings = (event: React.MouseEvent<HTMLElement>): void => {
    setSettingsEl(event.currentTarget);
  };

  const handleCloseSettings = (): void => {
    setSettingsEl(null);
  };

  const handleChangeProfile = (id: string | undefined) => (): void => {
    if (id) {
      changeProfile({
        variables: {
          id,
          value: { flags: true },
        },
      });
    }
    handleClose();
  };

  const openSettings = Boolean(settingsEl);
  const profile = !loading && data && data.profile;

  return (
    <Card ref={ref} className={classes.root}>
      <CardContent className={clsx(classes.wrap, classes.noPadding)}>
        <div className={clsx(classes.grid, classes.main)}>
          <div className={clsx(classes.grid, classes.column)}>
            <div className={classes.topIcons}>
              <IconButton className={classes.noPadding} onClick={handleClose}>
                <ArrowBackRounded />
              </IconButton>
              <IsAdmin>
                <IconButton className={classes.noPadding} onClick={handleSettings}>
                  <MoreVertRounded />
                  <Popper
                    id="profile-setting"
                    placement="bottom-end"
                    className={classes.settingsPopper}
                    open={openSettings}
                    anchorEl={settingsEl}
                    transition
                  >
                    <Paper>
                      <ClickAwayListener onClickAway={handleCloseSettings}>
                        <MenuList>
                          <MenuItem onClick={handleChangeProfile(profile && profile.id)}>
                            {t('phonebook:profile.hide')}
                          </MenuItem>
                          <Link href={{ pathname: '/profile/edit', query: { id: profile && profile.id } }} passHref>
                            <MenuItem>{t('phonebook:profile.edit')}</MenuItem>
                          </Link>
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Popper>
                </IconButton>
              </IsAdmin>
            </div>
            <div className={classes.center}>
              {profile ? (
                <Avatar fullSize className={classes.avatar} profile={profile} />
              ) : (
                <Skeleton className={classes.avatar} variant="circle" />
              )}
            </div>
            <div className={classes.firstName}>
              <h2>{profile ? profile.lastName : <Skeleton variant="rect" width={120} />}</h2>
              <h2>{profile ? profile.firstName : <Skeleton variant="rect" width={150} />}</h2>
              <h2>{profile ? profile.middleName : <Skeleton variant="rect" width={120} />}</h2>
            </div>
            {profile && profile.disabled && (
              <div className={clsx(classes.center, classes.disabled)}>
                <span>{t(`phonebook:fields.disabled`)}</span>
              </div>
            )}
            {profile && profile.notShowing && (
              <div className={clsx(classes.center, classes.notShowing)}>
                <span>{t(`phonebook:fields.notShowing`)}</span>
              </div>
            )}
            {profile && profile.nameEng && (
              <div className={classes.center}>
                <span>{profile && profile.nameEng}</span>
              </div>
            )}
            {profile && profile.mobile && (
              <div className={classes.center}>
                <PhoneAndroidRounded />
                <span>{profile.mobile}</span>
              </div>
            )}
            {profile && profile.workPhone && (
              <div className={classes.center}>
                <PhoneRounded />
                <span>{profile.workPhone}</span>
              </div>
            )}
            {profile && profile.email && (
              <div className={classes.center}>
                <Link href={{ pathname: '/mail', query: { to: profile.email } }}>
                  <a>{profile.email}</a>
                </Link>
              </div>
            )}
          </div>
          <div className={clsx(classes.grid, classes.column)}>
            <div>
              <Paper>
                <List className={classes.list}>
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary={t(`phonebook:fields.company`)} />
                      <ListItemText
                        className={profile && profile.company && classes.pointer}
                        onClick={handleSearchClose(profile && profile.company)}
                        primary={profile ? profile.company : <Skeleton variant="rect" width={250} height={25} />}
                      />
                    </div>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary={t(`phonebook:fields.department`)} />
                      <ListItemText
                        className={profile && profile.department && classes.pointer}
                        onClick={handleSearchClose(profile && profile.department)}
                        primary={profile ? profile.department : <Skeleton variant="rect" width={250} height={25} />}
                      />
                    </div>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary={t(`phonebook:fields.title`)} />
                      <ListItemText
                        className={profile && profile.title && classes.pointer}
                        onClick={handleSearchClose(profile && profile.title)}
                        primary={profile ? profile.title : <Skeleton variant="rect" width={250} height={25} />}
                      />
                    </div>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary={t(`phonebook:fields.otdel`)} />
                      <ListItemText
                        primary={profile ? profile.otdel : <Skeleton variant="rect" width={250} height={25} />}
                      />
                    </div>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary={t(`phonebook:fields.manager`)} />
                      <ListItemText
                        className={classes.pointer}
                        onClick={handleProfile(profile && profile.manager && profile.manager.id)}
                        primary={
                          profile ? (
                            profile.manager ? (
                              `${profile.manager.lastName} ${profile.manager.firstName} ${profile.manager.middleName}`
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
                </List>
              </Paper>
            </div>
            <div>
              <Paper>
                <List className={classes.list}>
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary={t(`phonebook:fields.country`)} />
                      <ListItemText
                        primary={profile ? profile.country : <Skeleton variant="rect" width={250} height={25} />}
                      />
                    </div>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary={t(`phonebook:fields.region`)} />
                      <ListItemText
                        primary={profile ? profile.region : <Skeleton variant="rect" width={250} height={25} />}
                      />
                    </div>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary={t(`phonebook:fields.town`)} />
                      <ListItemText
                        primary={profile ? profile.town : <Skeleton variant="rect" width={250} height={25} />}
                      />
                    </div>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary={t(`phonebook:fields.street`)} />
                      <ListItemText
                        primary={profile ? profile.street : <Skeleton variant="rect" width={250} height={25} />}
                      />
                    </div>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <div className={classes.listItem}>
                      <ListItemText primary={t(`phonebook:fields.postalCode`)} />
                      <ListItemText
                        primary={profile ? profile.postalCode : <Skeleton variant="rect" width={250} height={25} />}
                      />
                    </div>
                  </ListItem>
                </List>
              </Paper>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export const ProfileComponent = React.memo(nextI18next.withTranslation('phonebook')(BaseProfileComponent));
