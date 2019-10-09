/** @format */

// #region Imports NPM
import React from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Hidden, /* Button, */ IconButton, Avatar } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
// import Link from 'next/link';
// #endregion
// #region Imports Local
// import { UserContext } from '../lib/types';
import HeaderBg from '../public/images/jpeg/header_bg.jpg';
import LogoMin from '../public/images/png/logo-min.png';
// #endregion

export const appBarHeight = 64;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      zIndex: theme.zIndex.drawer + 1,
      background: `url(${HeaderBg})`,
      backgroundSize: 'cover',
    },
    menuButton: {
      color: '#000',
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
  }),
);

interface AppBarProps {
  handleDrawerOpen(): void;
}

export default (props: AppBarProps): React.ReactElement => {
  const classes = useStyles({});
  // const user = useContext(UserContext);
  const { handleDrawerOpen } = props;

  return (
    <AppBar id="header" position="sticky" className={classes.root}>
      <Toolbar>
        <Hidden mdUp implementation="css">
          <IconButton
            edge="start"
            onClick={handleDrawerOpen}
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
        <div className={classes.logo}>
          <img src={LogoMin} alt="logo" />
        </div>
        <Avatar />
      </Toolbar>
    </AppBar>
  );
};
