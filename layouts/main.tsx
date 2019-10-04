/** @format */

// #region Imports NPM
import React, { useState, ReactNode } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
// #endregion

// #region Imports Local
import AppBar, { appBarHeight } from '../components/app-bar';
import Drawer, { drawerWidth } from '../components/drawer';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    content: {
      height: `calc(100vh - ${appBarHeight}px)`,
      overflow: 'auto',
      [theme.breakpoints.up('md')]: {
        marginLeft: drawerWidth,
      },
    },
  }),
);

interface Main {
  children: ReactNode;
}

export default (props: Main): React.ReactElement => {
  const classes = useStyles({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerOpen = (): void => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className={classes.root}>
      <AppBar handleDrawerOpen={handleDrawerOpen} />
      <Drawer open={drawerOpen} handleOpen={handleDrawerOpen} />
      <div id="content" className={classes.content}>
        {props.children}
      </div>
    </div>
  );
};
