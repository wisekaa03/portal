/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import clsx from 'clsx';
import { darken, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Popover, Box, Button, IconButton, Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import PhoneIcon from '@material-ui/icons/Phone';
import PhoneInTalkIcon from '@material-ui/icons/PhoneInTalk';
import PhoneIphoneIcon from '@material-ui/icons/PhoneIphone';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { ProfileContext } from '@lib/context';
import { appBarHeight } from '@lib/constants';
import type { AppBarComponentProps } from '@lib/types';
import RefreshButton from '@front/components/ui/refresh-button';
import Avatar from '@front/components/ui/avatar';
import LogoMin from '@images/png/logo_min.png'; // @todo: ?inline';
//#endregion

const avatarHeight = 48;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      zIndex: theme.zIndex.drawer + 1,
      // backgroundColor: '#F5FDFF',
      backgroundSize: 'cover',
    },
    refresh: {
      paddingRight: theme.spacing(),
      marginRight: theme.spacing(),
      borderRight: `1px dotted ${darken('#F5FDFF', 0.2)}`,
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
      backgroundColor: '#F5FDFF',
      minWidth: '200px',
      minHeight: '150px',
      display: 'grid',
      gridTemplateColumns: `200px ${avatarHeight}px`,
      borderRadius: theme.shape.borderRadius,
    },
    pointer: {
      cursor: 'pointer',
    },
    avatarWrap: {
      padding: theme.spacing(0.5),
    },
    profileName: {
      margin: theme.spacing(),
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

const AppBarComponent: FC<AppBarComponentProps> = ({
  open,
  anchorEl,
  refetchComponent,
  refetchLoading,
  handleDrawerOpen,
  handlePopoverOpen,
  handlePopoverClose,
  handleLogout,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  return (
    <AppBar id="header" position="sticky" className={classes.root}>
      <Toolbar className={classes.toolbar}>
        <ProfileContext.Consumer>
          {({ user }) => (
            <>
              {user && (
                <>
                  <IconButton edge="start" onClick={handleDrawerOpen} className={classes.menuButton} color="inherit" aria-label="menu">
                    <MenuIcon />
                  </IconButton>
                  <div className={classes.logo}>
                    <img src={LogoMin} alt="logo" />
                  </div>
                  {refetchComponent && (
                    <Box className={classes.refresh} id="refresh-component">
                      <RefreshButton loading={refetchLoading} noAbsolute dense onClick={() => refetchComponent()} />
                    </Box>
                  )}
                  <Box id="profile-avatar" className={classes.avatarWrap} onClick={handlePopoverOpen}>
                    <Avatar className={clsx(classes.avatar, classes.pointer)} profile={user.profile} alt="photo" />
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
                      <Button variant="contained" color="secondary" className={classes.buttonLogout} onClick={handleLogout}>
                        {t('common:signOut')}
                      </Button>
                    </Box>
                  </Popover>
                </>
              )}
            </>
          )}
        </ProfileContext.Consumer>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
