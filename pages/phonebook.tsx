/** @format */

// #region Imports NPM
import React from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
// #endregion

const useStyles = makeStyles((/* theme: Theme */) =>
  createStyles({
    root: {},
  }));

export default function PhoneBook(): React.ReactElement {
  const classes = useStyles({});

  return (
    <Page>
      <div className={classes.root}>записная книга</div>
    </Page>
  );
}
