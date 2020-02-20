/** @format */

// #region Imports NPM
import React, { FC, useState, ReactNode, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/react-hooks';
import { Box, useMediaQuery } from '@material-ui/core';
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles';
// #endregion
// #region Imports Local
import { nextI18next } from '../lib/i18n-client';
import AppBarComponent, { appBarHeight } from '../components/app-bar';
import DrawerComponent from '../components/drawer';
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

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const classes = useStyles({});
  const theme = useTheme();
  const profile = useContext(ProfileContext);

  const router = useRouter();
  const isCollapse = router?.pathname && AUTO_COLLAPSE_ROUTES.some((r) => router.pathname.startsWith(r));

  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const ifModal = useMediaQuery(theme.breakpoints.down('sm'));

  const drawer = profile?.user?.settings.drawer as boolean | null;
  const { isMobile } = profile;
  const defaultDrawer = !isMobile && !ifModal && !isCollapse && (drawer !== null ? drawer : lgUp);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(defaultDrawer);

  const [userSettings] = useMutation(USER_SETTINGS);

  useEffect(() => {
    if (isMobile || ifModal) {
      setDrawerOpen(false);
    }
  }, [isMobile, ifModal]);

  useEffect(() => {
    if (!isMobile && !ifModal && !isCollapse) {
      setDrawerOpen(drawer === null ? lgUp : drawer);
    }
  }, [lgUp, drawer, isMobile, ifModal, isCollapse]);

  const handleDrawerOpen = (): void => {
    if (!isMobile && !ifModal) {
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
      <AppBarComponent handleDrawerOpen={handleDrawerOpen} />
      <Box display="flex" flexGrow={1}>
        <DrawerComponent open={drawerOpen} isMobile={isMobile} handleOpen={handleDrawerOpen} />
        <div id="content" className={classes.content}>
          {children}
        </div>
      </Box>
    </div>
  );
};

export default MainLayout;
