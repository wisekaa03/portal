/** @format */

import React from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  AppBar as AppBarMaterial,
  Toolbar,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles((/* theme: Theme */) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {},
    title: {
      flexGrow: 1,
    },
  }));

export default function AppBar(): React.ReactElement {
  const classes = useStyles({});

  return (
    <AppBarMaterial id="header" position="static" className={classes.root}>
      <Toolbar>
        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          Portal
        </Typography>
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBarMaterial>
  );
}
