/** @format */
/* eslint prettier/prettier: 0 */

// #region Imports NPM
import React, { useState } from 'react';
import Router from 'next/router';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Popover, Box, /* Button, */ IconButton, Avatar, Typography } from '@material-ui/core';
import clsx from 'clsx';
import MenuIcon from '@material-ui/icons/Menu';
import PhoneIcon from '@material-ui/icons/Phone';
import PhoneInTalkIcon from '@material-ui/icons/PhoneInTalk';
import PhoneIphoneIcon from '@material-ui/icons/PhoneIphone';
import { blue } from '@material-ui/core/colors';
// import Link from 'next/link';
// #endregion
// #region Imports Local
import { ProfileContext } from '../lib/types';
import HeaderBg from '../public/images/jpeg/header_bg.jpg';
import PopoverBg from '../public/images/png/profile_popover_bg.png';
import LogoMin from '../public/images/png/logo_min.png';
import { Loading } from './loading';
// #endregion

export const appBarHeight = 64;
const avatarHeight = 48;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      zIndex: theme.zIndex.drawer + 1,
      background: `url(${HeaderBg})`,
      backgroundSize: 'cover',
    },
    toolbar: {
      padding: `0 ${theme.spacing(2)}px`,
    },
    menuButton: {
      color: 'rgba(0, 0, 0, 0.54)',
    },
    logo: {
      'flexGrow': 1,
      '& > img': {
        height: '64px',
      },
    },
    title: {
      flexGrow: 1,
    },
    avatar: {
      background: blue[400],
      height: avatarHeight,
      width: avatarHeight,
    },
    profile: {
      padding: theme.spacing() / 2,
      background: `url(${PopoverBg})`,
      minWidth: '200px',
      minHeight: '150px',
      display: 'grid',
      gridTemplateColumns: `200px ${avatarHeight}px`,
      borderRadius: theme.spacing() / 2,
    },
    pointer: {
      cursor: 'pointer',
    },
    avatarWrap: {
      padding: theme.spacing() / 2,
    },
    profileName: {
      margin: theme.spacing(),
      fontSize: '16px',
    },
    phoneBlock: {
      display: 'grid',
      gridTemplateColumns: '1fr 5fr',
      gridGap: theme.spacing(),
      padding: theme.spacing(),
      alignItems: 'center',
    },
  }),
);

interface AppBarProps {
  handleDrawerOpen(): void;
}

export default (props: AppBarProps): React.ReactElement => {
  const classes = useStyles({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // const user = useContext(UserContext);
  const { handleDrawerOpen } = props;

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
          {(v) => {
            // Проверка на вшивость
            if (!v || !v.user || !v.user.profile) {
              Router.push('/auth/login');

              return <Loading />;
            }

            return (
              <>
                <IconButton
                  edge="start"
                  onClick={handleDrawerOpen}
                  className={classes.menuButton}
                  color="inherit"
                  aria-label="menu"
                >
                  <MenuIcon />
                </IconButton>
                <div className={classes.logo}>
                  <img src={LogoMin} alt="logo" />
                </div>
                <Box id="profile-avatar" className={classes.avatarWrap} onClick={handlePopoverOpen}>
                  <Avatar
                    className={clsx(classes.avatar, classes.pointer)}
                    src={
                      v.user.profile.thumbnailPhoto
                        ? `data:image/png;base64,${v.user.profile.thumbnailPhoto}`
                        : v.user.profile.gender === 1
                          ? '/public/images/jpeg/photo/man.jpg'
                          : v.user.profile.gender === 2
                            ? '/public/images/jpeg/photo/woman.jpg'
                            : '/public/images/jpeg/photo/alien.jpg'
                    }
                  />
                </Box>
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
                  <Typography className={classes.profileName}>
                    {v.user.profile.firstName} {v.user.profile.lastName} {v.user.profile.middleName}
                  </Typography>
                  <Avatar
                    className={classes.avatar}
                    src={
                      v.user.profile.thumbnailPhoto
                        ? `data:image/png;base64,${v.user.profile.thumbnailPhoto}`
                        : v.user.profile.gender === 1
                          ? '/public/images/jpeg/photo/man.jpg'
                          : v.user.profile.gender === 2
                            ? '/public/images/jpeg/photo/woman.jpg'
                            : '/public/images/jpeg/photo/alien.jpg'
                    }
                  />
                  <Box className={classes.phoneBlock}>
                    {v.user.profile.telephone ? (
                      <>
                        <PhoneIcon />
                        <Typography>{v.user.profile.telephone}</Typography>
                      </>
                    ) : null}
                    {v.user.profile.mobile ? (
                      <>
                        <PhoneIphoneIcon />
                        <Typography>{v.user.profile.mobile}</Typography>
                      </>
                    ) : null}
                    {v.user.profile.workPhone ? (
                      <>
                        <PhoneInTalkIcon />
                        <Typography>{v.user.profile.workPhone}</Typography>
                      </>
                    ) : null}
                  </Box>
                </Popover>
              </>
            );
          }}
        </ProfileContext.Consumer>
      </Toolbar>
    </AppBar>
  );
};
