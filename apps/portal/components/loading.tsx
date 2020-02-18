/** @format */

// #region Imports NPM
import React from 'react';

import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { LinearProgress, CircularProgress, Box } from '@material-ui/core';
import clsx from 'clsx';
// #endregion
// #region Imports Local
import ConditionalWrapper from '../lib/conditional-wrapper';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    loading: {
      color: 'red',
    },
    margin: {
      margin: theme.spacing(2),
    },
    fixed: {
      display: 'block',
      position: 'fixed',
      width: '100%',
    },
    absolute: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
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
  full?: boolean;
  noMargin?: boolean;
  absolute?: boolean;
}> = ({ variant, disableShrink, size, thickness, color, type, noMargin, full, absolute }) => {
  const classes = useStyles({});

  if (type === 'linear') {
    const className = clsx(classes.loading, {
      [classes.margin]: !noMargin,
      [classes.fixed]: noMargin,
    });

    return (
      <LinearProgress
        variant={(variant as 'determinate' | 'indeterminate' | 'buffer' | 'query') || 'indeterminate'}
        className={className}
      />
    );
  }

  return (
    <ConditionalWrapper
      condition={full}
      wrapper={(children) => (
        <Box
          className={clsx({ [classes.absolute]: absolute })}
          display="flex"
          height="100%"
          width="100%"
          justifyContent="center"
          alignItems="center"
        >
          {children}
        </Box>
      )}
    >
      <CircularProgress
        color={color || 'primary'}
        variant={(variant as 'determinate' | 'indeterminate' | 'static') || 'indeterminate'}
        disableShrink={disableShrink || false}
        size={size || 24}
        thickness={thickness || 4}
        className={clsx({
          [classes.margin]: !noMargin,
        })}
      />
    </ConditionalWrapper>
  );
};
