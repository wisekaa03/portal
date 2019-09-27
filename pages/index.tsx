/** @format */

// #region Imports NPM
import React from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Typography, Button, Card, CardContent } from '@material-ui/core';
// #endregion

// #region Imports Local
import Page from '../layouts/main';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 480,
      margin: `${theme.spacing(2)}px auto`,
    },
    card: {
      padding: theme.spacing(4),
    },
  }),
);

export default function App(): React.ReactElement {
  const classes = useStyles({});

  return (
    <Page>
      <div className={classes.root}>
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="body1">Hello, world !</Typography>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
