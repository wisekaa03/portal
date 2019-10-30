/** @format */

// #region Imports NPM
import React, { useState, ReactNode, useEffect, useContext } from 'react';
import { useMediaQuery } from '@material-ui/core';
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles';
// #endregion
// #region Imports Local
import { I18nPage, nextI18next } from '../lib/i18n-client';
import AppBar from '../components/app-bar';
import Drawer from '../components/drawer';
import { ProfileContext } from '../lib/types';
// #endregion

const useStyles = makeStyles((/* theme: Theme */) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    },
    main: {
      display: 'flex',
      flex: 1,
    },
    content: {
      flex: 1,
      display: 'flex',
      overflow: 'hidden',
    },
  }));

interface Main {
  children: ReactNode;
}

const MainTemplate: I18nPage<Main> = (props): React.ReactElement => {
  const classes = useStyles({});
  const theme = useTheme();
  const profile = useContext(ProfileContext);
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const defaultOpen = profile.isMobile ? false : lgUp;
  const [drawerOpen, setDrawerOpen] = useState<boolean>(defaultOpen);

  useEffect(() => {
    setDrawerOpen(lgUp);
  }, [lgUp]);

  const handleDrawerOpen = (): void => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className={classes.root}>
      <AppBar handleDrawerOpen={handleDrawerOpen} />
      <div className={classes.main}>
        <Drawer open={drawerOpen} isMobile={profile.isMobile} handleOpen={handleDrawerOpen} {...props} />
        <div id="content" className={classes.content}>
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default nextI18next.withTranslation('common')(MainTemplate);
