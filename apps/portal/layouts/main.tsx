/** @format */

// #region Imports NPM
import React, { useState, ReactNode, useEffect, useContext } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { Box, useMediaQuery } from '@material-ui/core';
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles';
// #endregion
// #region Imports Local
import { useRouter } from 'next/router';
import { I18nPage, nextI18next } from '../lib/i18n-client';
import AppBar, { appBarHeight } from '../components/app-bar';
import Drawer from '../components/drawer';
import { ProfileContext } from '../lib/context';
import { USER_SETTINGS } from '../lib/queries';
import { AUTO_COLLAPSE_ROUTES } from '../lib/constants';
// #endregion

const useStyles = makeStyles((/* theme: Theme */) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    },
    content: {
      'flex': 1,
      'display': 'flex',
      'overflow': 'hidden',
      'height': `calc(100vh - ${appBarHeight}px)`,

      '& > div': {
        width: '100%',
        flex: 1,
      },
    },
  }));

interface Main {
  children: ReactNode;
}

const MainTemplate: I18nPage<Main> = (props): React.ReactElement => {
  const classes = useStyles({});
  const theme = useTheme();
  const profile = useContext(ProfileContext);

  const router = useRouter();
  const isCollapse = router && router.pathname && AUTO_COLLAPSE_ROUTES.some((r) => router.pathname.startsWith(r));

  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const ifModal = useMediaQuery(theme.breakpoints.down('sm'));

  const drawer = (profile.user && profile.user.settings && profile.user.settings.drawer) as boolean | null;
  const defaultDrawer = !profile.isMobile && !ifModal && !isCollapse && (drawer !== null ? drawer : lgUp);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(defaultDrawer);

  const [userSettings] = useMutation(USER_SETTINGS);

  useEffect(() => {
    if (profile.isMobile || ifModal) {
      setDrawerOpen(false);
    }
  }, [profile.isMobile, ifModal]);

  useEffect(() => {
    if (!profile.isMobile && !ifModal && !isCollapse) {
      setDrawerOpen(drawer === null ? lgUp : drawer);
    }
  }, [lgUp, drawer, profile.isMobile, ifModal, isCollapse]);

  const handleDrawerOpen = (): void => {
    if (!profile.isMobile && !ifModal) {
      userSettings({
        variables: {
          value: { drawer: !drawerOpen },
        },
      });
    }
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className={classes.root}>
      <AppBar handleDrawerOpen={handleDrawerOpen} />
      <Box display="flex" flexGrow={1}>
        <Drawer open={drawerOpen} isMobile={profile.isMobile} handleOpen={handleDrawerOpen} {...props} />
        <div id="content" className={classes.content}>
          {props.children}
        </div>
      </Box>
    </div>
  );
};

export default nextI18next.withTranslation('common')(MainTemplate);
