/** @format */

// #region Imports NPM
import React, { FC, useState, useEffect, useContext } from 'react';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import { Box, useMediaQuery } from '@material-ui/core';
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles';
// #endregion
// #region Imports Local
import AppBarComponent, { appBarHeight } from '../components/app-bar';
import DrawerComponent from '../components/drawer';
import { ProfileContext } from '../lib/context';
import { LOGOUT, USER_SETTINGS } from '../lib/queries';
import { removeStorage } from '../lib/session-storage';
import { SESSION, FIRST_PAGE, AUTH_PAGE, AUTO_COLLAPSE_ROUTES } from '../lib/constants';
import Cookie from '../lib/cookie';
// #endregion

const useStyles = makeStyles((/* theme: Theme */) =>
  createStyles({
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

const MainLayout: FC = ({ children }) => {
  const classes = useStyles({});

  const profile = useContext(ProfileContext);
  const drawer = profile?.user?.settings.drawer;
  const { isMobile } = profile;

  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const ifModal = useMediaQuery(theme.breakpoints.down('sm'));

  const client = useApolloClient();
  const router = useRouter();
  const isCollapse = router.pathname && AUTO_COLLAPSE_ROUTES.some((r) => router.pathname.startsWith(r));

  const [drawerOpen, setDrawerOpen] = useState<boolean>(
    !isMobile && !ifModal && !isCollapse && (drawer === undefined || drawer === null ? lgUp : drawer),
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [userSettings] = useMutation(USER_SETTINGS);

  const [logout] = useMutation(LOGOUT, {
    onCompleted: () => {
      removeStorage(SESSION);
      Cookie.remove(process.env.SESSION_NAME || 'portal');

      client
        .clearStore()
        .then(() => {
          client.resetStore();
          const { pathname = FIRST_PAGE } = router;
          return router.push({ pathname: AUTH_PAGE, query: { redirect: pathname } });
        })
        .catch((error) => {
          throw error;
        });
    },
  });

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

  const handleLogout = (): void => {
    logout();
  };

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = (): void => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (isMobile || ifModal) {
      setDrawerOpen(false);
    }
  }, [isMobile, ifModal]);

  useEffect(() => {
    if (!isMobile && !ifModal && !isCollapse) {
      setDrawerOpen(drawer === undefined || drawer === null ? lgUp : drawer);
    }
  }, [lgUp, drawer, isMobile, ifModal, isCollapse]);

  return (
    <Box display="flex" flexDirection="column" style={{ height: '100vh' }}>
      <AppBarComponent
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        handleDrawerOpen={handleDrawerOpen}
        handlePopoverOpen={handlePopoverOpen}
        handlePopoverClose={handlePopoverClose}
        handleLogout={handleLogout}
      />
      <Box display="flex" flexGrow={1}>
        <DrawerComponent open={drawerOpen} isMobile={isMobile} handleOpen={handleDrawerOpen} />
        <Box id="content" className={classes.content}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
