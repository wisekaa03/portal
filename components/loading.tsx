/** @format */

// #region Imports NPM
import React from 'react';

import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
// #endregion

// #region Imports Local
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    loading: {
      margin: theme.spacing(2),
      color: 'red',
    },
  }),
);

export const Loading: React.FC<{
  variant?: 'determinate' | 'indeterminate' | 'static' | 'buffer' | 'query';
  disableShrink?: boolean;
  size?: number;
  thickness?: number;
  color?: 'primary' | 'secondary' | 'inherit';
  type?: 'linear' | 'circular';
}> = ({ variant, disableShrink, size, thickness, color, type }) => {
  const classes = useStyles({});

  if (type === 'linear') {
    return (
      <LinearProgress
        variant={(variant as 'determinate' | 'indeterminate' | 'buffer' | 'query') || 'indeterminate'}
        className={classes.loading}
      />
    );
  }

  return (
    <CircularProgress
      color={color || 'primary'}
      variant={(variant as 'determinate' | 'indeterminate' | 'static') || 'indeterminate'}
      disableShrink={disableShrink || false}
      size={size || 24}
      thickness={thickness || 4}
      className={classes.loading}
    />
  );
};
