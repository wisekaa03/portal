/** @format */

// #region Imports NPM
import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import queryString from 'query-string';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import Iframe from '../components/iframe';
// #endregion

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'block',
      border: 'none',
      height: '100%',
      width: '100%',
    },
  }),
);

export default (props: any): React.ReactElement => {
  const classes = useStyles({});
  const { to } = queryString.parse(window.location.search);
  const url = `https://roundcube.i-npz.ru/${to ? `?_task=mail&_action=compose&to=${to}` : ''}`;

  return (
    <Page {...props}>
      <Iframe className={classes.root} url={url} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
    </Page>
  );
};
