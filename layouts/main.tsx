/** @format */

// #region Imports NPM
import React, { ReactNode } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
// #endregion

// #region Imports Local
import AppBar from '../components/app-bar';
// #endregion

const useStyles = makeStyles((/* theme: Theme */) =>
  createStyles({
    root: {},
  }));

interface Main {
  children: ReactNode;
}

export default (props: Main): React.ReactElement => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <AppBar />
      <div id="content">{props.children}</div>
    </div>
  );
};
