/** @format */

// #region Imports NPM
import React from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Hidden, Button, Card, CardContent, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import Link from 'next/link';
// #endregion
// #region Imports Local
import LogoMin from '../static/images/png/logo-min.png';
// #endregion

export const appBarHeight = 64;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      zIndex: theme.zIndex.drawer + 1,
      background: 'url(/images/jpeg/header_bg.jpg) no-repeat center left',
      // backgroundSize: '100px 200px',
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

        <Button color="inherit">
          <Link href="/auth/login">
            <a>Login</a>
          </Link>
        </Button>
      </Toolbar>
    </AppBar>
  );
};
