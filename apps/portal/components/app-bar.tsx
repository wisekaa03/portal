/** @format */

// #region Imports NPM
import React, { FC, useState } from 'react';
import Router from 'next/router';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Popover, Box, Button, IconButton, Typography } from '@material-ui/core';
import clsx from 'clsx';
import MenuIcon from '@material-ui/icons/Menu';
import PhoneIcon from '@material-ui/icons/Phone';
import PhoneInTalkIcon from '@material-ui/icons/PhoneInTalk';
import PhoneIphoneIcon from '@material-ui/icons/PhoneIphone';
import Skeleton from '@material-ui/lab/Skeleton';
// #endregion
// #region Imports Local
import HeaderBg from '../../../public/images/jpeg/header_bg.jpg';
import PopoverBg from '../../../public/images/png/profile_popover_bg.png';
import LogoMin from '../../../public/images/png/logo_min.png';
import { nextI18next, useTranslation } from '../lib/i18n-client';
import { ProfileContext } from '../lib/context';
import { LOGOUT } from '../lib/queries';
import { removeStorage } from '../lib/session-storage';
import Avatar from './ui/avatar';
import { SESSION, FIRST_PAGE } from '../lib/constants';

// #endregion

const avatarHeight = 48;
export const appBarHeight = 64;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      zIndex: theme.zIndex.drawer + 1,
      background: `url(${HeaderBg})`,
      backgroundSize: 'cover',
    },
    toolbar: {
      padding: theme.spacing(0, 2),
    },
    menuButton: {
      color: 'rgba(0, 0, 0, 0.54)',
    },
    logo: {
      'flexGrow': 1,
      '& > img': {
        height: appBarHeight,
      },
    },
    title: {
      flexGrow: 1,
    },
    avatar: {
      height: avatarHeight,
      width: avatarHeight,
    },
    profile: {
      padding: theme.spacing(0.5),
      background: `url(${PopoverBg})`,
      minWidth: '200px',
      minHeight: '150px',
      display: 'grid',
      gridTemplateColumns: `200px ${avatarHeight}px`,
      borderRadius: theme.spacing(0.5),
    },
    pointer: {
      cursor: 'pointer',
    },
    avatarWrap: {
      padding: theme.spacing(0.5),
    },
    profileName: {
      margin: theme.spacing(),
      fontSize: '16px',
    },
    commonBlock: {
      display: 'grid',
      gridColumn: '1 / 3',
      gap: `${theme.spacing()}px`,
      padding: theme.spacing(),
    },
    phoneBlock: {
      display: 'grid',
      gridTemplateColumns: '1fr 6fr',
      gap: `${theme.spacing()}px 0`,
      alignItems: 'center',
    },
    buttonLogout: {
      // backgroundColor: blue[300],
    },
  }),
);

interface AppBarComponentProps {
  handleDrawerOpen(): void;
}

const AppBarComponent: FC<AppBarComponentProps> = ({ handleDrawerOpen }) => {
  const classes = useStyles({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const client = useApolloClient();
  const { t } = useTranslation();

  const [logout] = useMutation(LOGOUT, {
    onCompleted() {
      removeStorage(SESSION);
      client.resetStore();

      Router.push({ pathname: '/auth/login', query: { redirect: Router.pathname ? Router.pathname : FIRST_PAGE } });
    },
  });

  const handleLogout = (): void => {
    logout();
  };

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = (): void => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <AppBar id="header" position="sticky" className={classes.root}>
      <Toolbar className={classes.toolbar}>
        <ProfileContext.Consumer>
          {({ user }) => (
            <>
              <IconButton
                edge="start"
                onClick={user && handleDrawerOpen}
                className={classes.menuButton}
                color="inherit"
                aria-label="menu"
              >
                <MenuIcon />
              </IconButton>
              <div className={classes.logo}>
                <img src={LogoMin} alt="logo" />
              </div>
              <Box id="profile-avatar" className={classes.avatarWrap} onClick={user && handlePopoverOpen}>
                {user ? (
                  <Avatar className={clsx(classes.avatar, classes.pointer)} profile={user.profile} alt="photo" />
                ) : (
                  <Skeleton className={classes.avatar} variant="circle" />
                )}
              </Box>
              {user && (
                <Popover
                  id="profile-popover"
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handlePopoverClose}
                  classes={{ paper: classes.profile }}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  marginThreshold={0}
                  transitionDuration={0}
                  disableRestoreFocus
                >
                  <Typography className={classes.profileName}>{user.profile.fullName}</Typography>
                  <Avatar className={classes.avatar} profile={user.profile} alt="photo" />
                  <Box className={classes.commonBlock}>
                    <Box className={classes.phoneBlock}>
                      {user.profile.telephone && (
                        <>
                          <PhoneIcon />
                          <Typography>{user.profile.telephone}</Typography>
                        </>
                      )}
                      {user.profile.mobile && (
                        <>
                          <PhoneIphoneIcon />
                          <Typography>{user.profile.mobile}</Typography>
                        </>
                      )}
                      {user.profile.workPhone && (
                        <>
                          <PhoneInTalkIcon />
                          <Typography>{user.profile.workPhone}</Typography>
                        </>
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      color="secondary"
                      className={classes.buttonLogout}
                      onClick={handleLogout}
                    >
                      {t('common:signOut')}
                    </Button>
                  </Box>
                </Popover>
              )}
            </>
          )}
        </ProfileContext.Consumer>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
